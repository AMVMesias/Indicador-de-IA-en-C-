/**
 * Show command – reads analytics data and renders it for the terminal.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TimerEntry } from "./timer.ts";
import { formatDuration } from "./timer.ts";
import type { CommandEstimateRecord, TaskEstimateRecord } from "./estimator.ts";
import { humanReadableTime } from "./estimator.ts";
import { resolveProjectRoot } from "./config.ts";

/** Re-export of {@link formatDuration} for callers wanting the show-side name. */
export const formatMs = formatDuration;

/* ─── types ─── */

export interface SpecAnalytics {
  spec: string;
  timers: TimerEntry[];
  commandEstimates: CommandEstimateRecord[];
  taskEstimates: TaskEstimateRecord[];
}

export interface ShowTotals {
  realMs: number;
  juniorMinutes: number;
  seniorMinutes: number;
}

export interface ShowResult {
  specs: SpecAnalytics[];
  totals: ShowTotals;
}

export type ShowOutcome =
  | { ok: true; result: ShowResult; rendered: string }
  | { ok: false; error: string };

/* ─── duration parsing ─── */

/** Parse "1d 2h 13m" / "45m" / "5s" back to milliseconds. Accepts d/h/m/s. */
export function parseDuration(value: string): number {
  let ms = 0;
  for (const match of value.matchAll(/(\d+)\s*([dhms])/g)) {
    const n = Number(match[1]);
    const unit = match[2];
    if (unit === "d") ms += n * 86_400_000;
    else if (unit === "h") ms += n * 3_600_000;
    else if (unit === "m") ms += n * 60_000;
    else if (unit === "s") ms += n * 1000;
  }
  return ms;
}

/* ─── markdown parsers ─── */

/** Split a markdown analytics file into per-record blocks. */
function splitBlocks(content: string): string[] {
  return content
    .split(/^---\s*$/m)
    .map((b) => b.trim())
    .filter(Boolean);
}

function extractField(block: string, label: string): string | null {
  const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*\`([^\`]*)\``, "i");
  const m = block.match(re);
  return m ? m[1] ?? null : null;
}

function parseTimerMarkdown(content: string): TimerEntry[] {
  const out: TimerEntry[] = [];
  for (const block of splitBlocks(content)) {
    if (!/Command Execution/i.test(block)) continue;
    const command = extractField(block, "Command");
    if (command === null) continue;
    out.push({
      command,
      args: extractField(block, "Arguments") ?? "",
      model: extractField(block, "Model") ?? "",
      startTime: extractField(block, "Start") ?? "",
      endTime: extractField(block, "End") ?? "",
      duration: extractField(block, "Duration") ?? "",
    });
  }
  return out;
}

function parseCommandEstimateMarkdown(content: string): CommandEstimateRecord[] {
  const out: CommandEstimateRecord[] = [];
  for (const block of splitBlocks(content)) {
    if (!/Human Time Estimate/i.test(block)) continue;
    const command = extractField(block, "Command");
    if (command === null) continue;
    const junior = extractField(block, "Junior estimate") ?? "";
    const senior = extractField(block, "Senior estimate") ?? "";
    out.push({
      command,
      args: extractField(block, "Arguments") ?? "",
      model: extractField(block, "Model") ?? "",
      junior,
      senior,
      juniorMinutes: parseDuration(junior) / 60_000,
      seniorMinutes: parseDuration(senior) / 60_000,
    });
  }
  return out;
}

function parseTaskEstimateMarkdown(content: string): TaskEstimateRecord[] {
  const out: TaskEstimateRecord[] = [];
  const rowRe = /^\|\s*`([^`]+)`\s*\|\s*(.+?)\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*$/gm;
  for (const m of content.matchAll(rowRe)) {
    const taskId = m[1] ?? "";
    if (taskId === "Task ID") continue;
    const junior = m[3] ?? "";
    const senior = m[4] ?? "";
    out.push({
      taskId,
      description: m[2] ?? "",
      command: "",
      args: "",
      model: "",
      junior,
      senior,
      juniorMinutes: parseDuration(junior) / 60_000,
      seniorMinutes: parseDuration(senior) / 60_000,
    });
  }
  return out;
}

/* ─── file readers ─── */

function readJsonArray<T>(filePath: string): T[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [parsed as T];
  } catch {
    return [];
  }
}

function readTimerFiles(timeDir: string): TimerEntry[] {
  const out: TimerEntry[] = [];
  const flat = ["commands.json", "commands.md"];
  for (const name of flat) {
    const fp = path.join(timeDir, name);
    if (!fs.existsSync(fp) || !fs.statSync(fp).isFile()) continue;
    if (name.endsWith(".json")) out.push(...readJsonArray<TimerEntry>(fp));
    else out.push(...parseTimerMarkdown(fs.readFileSync(fp, "utf-8")));
  }
  const splitDir = path.join(timeDir, "commands");
  if (fs.existsSync(splitDir) && fs.statSync(splitDir).isDirectory()) {
    for (const entry of fs.readdirSync(splitDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const fp = path.join(splitDir, entry.name);
      if (entry.name.endsWith(".json")) out.push(...readJsonArray<TimerEntry>(fp));
      else if (entry.name.endsWith(".md")) out.push(...parseTimerMarkdown(fs.readFileSync(fp, "utf-8")));
    }
  }
  return out;
}

function readCommandEstimateFiles(estimatesDir: string): CommandEstimateRecord[] {
  const out: CommandEstimateRecord[] = [];
  if (!fs.existsSync(estimatesDir)) return out;
  for (const entry of fs.readdirSync(estimatesDir)) {
    if (entry === "tasks.md" || entry === "tasks.json") continue;
    const fp = path.join(estimatesDir, entry);
    if (!fs.statSync(fp).isFile()) continue;
    if (entry.endsWith(".json")) out.push(...readJsonArray<CommandEstimateRecord>(fp));
    else if (entry.endsWith(".md"))
      out.push(...parseCommandEstimateMarkdown(fs.readFileSync(fp, "utf-8")));
  }
  return out;
}

/**
 * Ensure juniorMinutes/seniorMinutes are populated.
 * The JSON writer stores only the human-readable strings for tasks, so totals
 * would be NaN without deriving the minute fields here.
 */
function normalizeTaskRecord(t: Partial<TaskEstimateRecord>): TaskEstimateRecord {
  const junior = t.junior ?? "";
  const senior = t.senior ?? "";
  const juniorMinutes = Number.isFinite(t.juniorMinutes)
    ? (t.juniorMinutes as number)
    : parseDuration(junior) / 60_000;
  const seniorMinutes = Number.isFinite(t.seniorMinutes)
    ? (t.seniorMinutes as number)
    : parseDuration(senior) / 60_000;
  return {
    taskId: t.taskId ?? "",
    description: t.description ?? "",
    command: t.command ?? "",
    args: t.args ?? "",
    model: t.model ?? "",
    junior,
    senior,
    juniorMinutes,
    seniorMinutes,
  };
}

function readTaskEstimateFiles(estimatesDir: string): TaskEstimateRecord[] {
  const out: TaskEstimateRecord[] = [];
  for (const name of ["tasks.json", "tasks.md"]) {
    const fp = path.join(estimatesDir, name);
    if (!fs.existsSync(fp)) continue;
    if (name.endsWith(".json")) {
      out.push(...readJsonArray<Partial<TaskEstimateRecord>>(fp).map(normalizeTaskRecord));
    } else {
      out.push(...parseTaskEstimateMarkdown(fs.readFileSync(fp, "utf-8")));
    }
  }
  return out;
}

/* ─── gathering ─── */

export function gatherSpec(specFolder: string, specName: string): SpecAnalytics {
  const timeDir = path.join(specFolder, "analytics", "time");
  const estimatesDir = path.join(timeDir, "humanEstimates");
  return {
    spec: specName,
    timers: readTimerFiles(timeDir),
    commandEstimates: readCommandEstimateFiles(estimatesDir),
    taskEstimates: readTaskEstimateFiles(estimatesDir),
  };
}

/**
 * Candidate roots where specs may live, ordered by precedence.
 * Real Spec Kit projects use `<projectRoot>/specs/`; the legacy/tests layout
 * uses `<projectRoot>/.specify/specs/`. Both are scanned so the command works
 * regardless of how the project was bootstrapped.
 */
function specsRoots(projectRoot: string): string[] {
  return [
    path.join(projectRoot, "specs"),
    path.join(projectRoot, ".specify", "specs"),
  ];
}

/** A spec name must address a single direct child of a specs root. */
function isSafeSpecName(name: string): boolean {
  if (!name) return false;
  if (name.includes("/") || name.includes("\\")) return false;
  if (name === "." || name === "..") return false;
  return true;
}

export function gather(projectRoot: string, target: string | null): SpecAnalytics[] {
  const roots = specsRoots(projectRoot);

  if (target && target !== "--all" && target !== "all") {
    if (!isSafeSpecName(target)) return [];
    for (const root of roots) {
      const folder = path.join(root, target);
      if (fs.existsSync(folder)) return [gatherSpec(folder, target)];
    }
    return [];
  }

  const seen = new Set<string>();
  const out: SpecAnalytics[] = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || seen.has(entry.name)) continue;
      const folder = path.join(root, entry.name);
      if (!fs.existsSync(path.join(folder, "analytics"))) continue;
      seen.add(entry.name);
      out.push(gatherSpec(folder, entry.name));
    }
  }
  return out;
}

export function totals(specs: SpecAnalytics[]): ShowTotals {
  let realMs = 0;
  let juniorMinutes = 0;
  let seniorMinutes = 0;
  for (const s of specs) {
    for (const t of s.timers) realMs += parseDuration(t.duration);
    for (const c of s.commandEstimates) {
      juniorMinutes += c.juniorMinutes;
      seniorMinutes += c.seniorMinutes;
    }
  }
  return { realMs, juniorMinutes, seniorMinutes };
}

/* ─── rendering ─── */

const RULE = "─".repeat(60);

function renderSpecBlock(spec: SpecAnalytics): string {
  const lines: string[] = [];
  lines.push(`📁 Spec: ${spec.spec}`);
  lines.push(RULE);

  if (spec.timers.length === 0 && spec.commandEstimates.length === 0 && spec.taskEstimates.length === 0) {
    lines.push("  (no analytics data)");
    lines.push("");
    return lines.join("\n");
  }

  if (spec.timers.length > 0) {
    lines.push("⏱  Execution Timer");
    for (const t of spec.timers) {
      const cmd = t.command || "unknown";
      const args = t.args ? ` "${t.args}"` : "";
      lines.push(`  • ${cmd}${args}  →  ${t.duration || "?"}  [${t.model || "?"}]`);
    }
    const real = spec.timers.reduce((acc, t) => acc + parseDuration(t.duration), 0);
    lines.push(`  Σ total: ${formatMs(real)}`);
    lines.push("");
  }

  if (spec.commandEstimates.length > 0) {
    lines.push("👤 Human Time Estimates (per command)");
    for (const c of spec.commandEstimates) {
      lines.push(
        `  • ${c.command || "unknown"}  →  junior ${c.junior}, senior ${c.senior}`,
      );
    }
    const juniorMin = spec.commandEstimates.reduce((a, c) => a + c.juniorMinutes, 0);
    const seniorMin = spec.commandEstimates.reduce((a, c) => a + c.seniorMinutes, 0);
    lines.push(
      `  Σ junior: ${humanReadableTime(juniorMin)}   senior: ${humanReadableTime(seniorMin)}`,
    );
    lines.push("");
  }

  if (spec.taskEstimates.length > 0) {
    lines.push("📋 Task Projections");
    for (const t of spec.taskEstimates) {
      lines.push(
        `  • ${t.taskId}  ${t.description}  →  junior ${t.junior}, senior ${t.senior}`,
      );
    }
    const juniorMin = spec.taskEstimates.reduce((a, t) => a + t.juniorMinutes, 0);
    const seniorMin = spec.taskEstimates.reduce((a, t) => a + t.seniorMinutes, 0);
    lines.push(
      `  Σ junior: ${humanReadableTime(juniorMin)}   senior: ${humanReadableTime(seniorMin)}`,
    );
    lines.push("");
  }

  return lines.join("\n");
}

export function render(specs: SpecAnalytics[]): string {
  if (specs.length === 0) {
    return "No analytics data found. Run a Spec Kit command first to collect metrics.\n";
  }
  const lines: string[] = [];
  lines.push("");
  lines.push("📊 spec-kit-analytics");
  lines.push("");
  for (const s of specs) lines.push(renderSpecBlock(s));

  if (specs.length > 1) {
    const t = totals(specs);
    lines.push(RULE);
    lines.push("Σ Project totals");
    lines.push(`  Real execution time: ${formatMs(t.realMs)}`);
    // humanReadableTime clamps any value < 1 minute to "1m", so guard the
    // estimated/saved lines on real data — otherwise a project with timers
    // but no estimates would print fabricated "junior: 1m senior: 1m".
    if (t.juniorMinutes > 0 || t.seniorMinutes > 0) {
      lines.push(
        `  Estimated human time → junior: ${humanReadableTime(t.juniorMinutes)}   senior: ${humanReadableTime(t.seniorMinutes)}`,
      );
      const savedJunior = t.juniorMinutes * 60_000 - t.realMs;
      const savedSenior = t.seniorMinutes * 60_000 - t.realMs;
      if (savedJunior > 0 || savedSenior > 0) {
        lines.push(
          `  Time saved vs human → junior: ${formatMs(Math.max(0, savedJunior))}   senior: ${formatMs(Math.max(0, savedSenior))}`,
        );
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

/* ─── public entry point ─── */

export function execute(projectRoot: string, args: string): ShowOutcome {
  const target = args && args.trim() !== "" ? args.trim() : null;
  const specs = gather(projectRoot, target);
  return { ok: true, result: { specs, totals: totals(specs) }, rendered: render(specs) };
}

/* ─── CLI entry ─── */
// Fires only when this module is the Node entry point (e.g. `node src/show.ts`).
// Compares realpaths so symlinks (typical .specify/extensions install) don't break detection.
// Stays inert when imported as a library (tests, controllers, …).
function isCliEntry(): boolean {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isCliEntry()) {
  const target = process.argv.slice(2).join(" ");
  const root = resolveProjectRoot(import.meta.url);
  const outcome = execute(root, target);
  if (!outcome.ok) {
    process.stderr.write(`Error: ${outcome.error}\n`);
    process.exit(1);
  }
  process.stdout.write(outcome.rendered);
}
