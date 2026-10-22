/**
 * Execution Timer – records start/end timestamps and durations for commands.
 */

import fs from "node:fs";
import path from "node:path";
import * as config from "./config.ts";

const STATE_FILE = ".specify/.analytics-timer-state.json";

interface TimerState {
  command: string;
  args: string;
  model: string;
  startTime: string;
}

export interface TimerEntry {
  command: string;
  args: string;
  model: string;
  startTime: string;
  endTime: string;
  duration: string;
}

export function statePath(projectRoot: string): string {
  return path.join(projectRoot, STATE_FILE);
}

export function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const d = Math.floor(totalSec / 86_400);
  const h = Math.floor((totalSec % 86_400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

/** Pre-command: record start timestamp to state file. */
export function recordStart(
  projectRoot: string,
  command: string,
  args: string,
  model: string,
): void {
  const state: TimerState = { command, args, model, startTime: new Date().toISOString() };
  const p = statePath(projectRoot);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(state, null, 2), "utf-8");
}

/** Post-command: read state, calculate duration, write log, clean up. */
export function recordEnd(projectRoot: string, specFolder: string): TimerEntry | null {
  const p = statePath(projectRoot);
  if (!fs.existsSync(p)) return null;

  const state = JSON.parse(fs.readFileSync(p, "utf-8")) as TimerState;
  const endTime = new Date().toISOString();
  const durationMs = new Date(endTime).getTime() - new Date(state.startTime).getTime();
  const duration = formatDuration(durationMs);

  const cfg = config.load(projectRoot);
  const entry: TimerEntry = {
    command: state.command,
    args: state.args,
    model: state.model,
    startTime: state.startTime,
    endTime,
    duration,
  };

  writeTimerEntry(specFolder, cfg, entry);

  fs.unlinkSync(p);
  return entry;
}

export function writeTimerEntry(
  specFolder: string,
  cfg: config.AnalyticsConfig,
  entry: TimerEntry,
): void {
  const ext = config.getExt(cfg);
  const fmt = config.getFormat(cfg);

  let filePath: string;
  if (cfg.times?.splitByCommands) {
    const cmdName = (entry.command || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
    filePath = path.join(specFolder, "analytics", "time", "commands", cmdName + ext);
  } else {
    filePath = path.join(specFolder, "analytics", "time", "commands" + ext);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  if (fmt === "json") {
    writeJsonEntry(filePath, entry);
  } else {
    writeMdEntry(filePath, entry);
  }
}

function writeJsonEntry(filePath: string, entry: TimerEntry): void {
  let existing: TimerEntry[] = [];
  if (fs.existsSync(filePath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as unknown;
      existing = Array.isArray(parsed) ? (parsed as TimerEntry[]) : [parsed as TimerEntry];
    } catch {
      existing = [];
    }
  }
  existing.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
}

function writeMdEntry(filePath: string, entry: TimerEntry): void {
  const block = [
    `## Command Execution`,
    ``,
    `- **Command:** \`${entry.command}\``,
    `- **Arguments:** \`${entry.args}\``,
    `- **Model:** \`${entry.model}\``,
    `- **Start:** \`${entry.startTime}\``,
    `- **End:** \`${entry.endTime}\``,
    `- **Duration:** \`${entry.duration}\``,
    ``,
    `---`,
    ``,
  ].join("\n");

  fs.appendFileSync(filePath, block, "utf-8");
}
