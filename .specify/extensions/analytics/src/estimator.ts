/**
 * Dynamic Human Time Estimator
 */

import fs from "node:fs";
import path from "node:path";
import * as config from "./config.ts";
import type { TimerEntry } from "./timer.ts";

/* ─── types ─── */

export interface LlmCommandResult {
  junior: number;
  senior: number;
}

export interface LlmTaskResult {
  taskId: string;
  description: string;
  junior: number;
  senior: number;
}

export interface CommandEstimateRecord {
  command: string;
  args: string;
  model: string;
  junior: string;
  senior: string;
  juniorMinutes: number;
  seniorMinutes: number;
}

export interface TaskEstimateRecord extends CommandEstimateRecord {
  taskId: string;
  description: string;
}

export type LlmCaller = (
  prompt: string,
) => Promise<LlmCommandResult | LlmTaskResult[]>;

/* ─── LLM caller (injectable for testing) ─── */

let llmCaller: LlmCaller = async (_prompt: string) => {
  throw new Error(
    "LLM caller not configured. Call estimator.setLlmCaller() or configure the Spec Kit LLM bridge.",
  );
};

export function setLlmCaller(fn: LlmCaller): void {
  llmCaller = fn;
}

export function getLlmCaller(): LlmCaller {
  return llmCaller;
}

/* ─── readable time helper ─── */

export function humanReadableTime(minutes: number): string {
  if (minutes < 1) minutes = 1;
  const d = Math.floor(minutes / (60 * 24));
  const h = Math.floor((minutes % (60 * 24)) / 60);
  const m = Math.round(minutes % 60);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m || parts.length === 0) parts.push(`${m}m`);
  return parts.join(" ");
}

/* ─── Prompt builders ─── */

export function buildCommandPrompt(
  command: string,
  args: string,
  model: string,
  documentContent: string,
): string {
  return [
    `You are an expert software estimation analyst.`,
    `A developer used an AI agent (model: ${model}) to run the command \`${command}\` with arguments: "${args}".`,
    `The resulting document content is shown below.`,
    ``,
    `Estimate how long it would take a human to manually produce this document from scratch, including:`,
    `- Thinking and planning`,
    `- Writing the full content`,
    `- Self-reviewing and polishing`,
    ``,
    `Provide two estimates in MINUTES (integers only):`,
    `1. A **junior** developer (1-2 years experience)`,
    `2. A **senior** developer (5+ years experience)`,
    ``,
    `Reply ONLY with valid JSON: {"junior": <number>, "senior": <number>}`,
    ``,
    `--- DOCUMENT START ---`,
    documentContent,
    `--- DOCUMENT END ---`,
  ].join("\n");
}

export function buildTasksPrompt(tasks: string): string {
  return [
    `You are an expert software estimation analyst.`,
    `Below is a list of implementation tasks extracted from a tasks.md file.`,
    `For EACH task, estimate how long it would take a human to implement it, including:`,
    `- Thinking and planning the approach`,
    `- Developing / writing the code`,
    `- Self-reviewing and testing`,
    ``,
    `Provide two estimates per task in MINUTES (integers only):`,
    `1. A **junior** developer (1-2 years experience)`,
    `2. A **senior** developer (5+ years experience)`,
    ``,
    `Reply ONLY with valid JSON array:`,
    `[{"taskId": "T001", "description": "...", "junior": <number>, "senior": <number>}, ...]`,
    ``,
    `--- TASKS START ---`,
    tasks,
    `--- TASKS END ---`,
  ].join("\n");
}

/* ─── Evaluation runners ─── */

export async function evaluateCommand(
  projectRoot: string,
  specFolder: string,
  entry: Pick<TimerEntry, "command" | "args" | "model">,
  documentContent: string,
): Promise<CommandEstimateRecord | null> {
  const cfg = config.load(projectRoot);
  if (!cfg.humanEstimates?.commands) return null;

  const prompt = buildCommandPrompt(entry.command, entry.args, entry.model, documentContent);
  const result = (await llmCaller(prompt)) as LlmCommandResult;

  const record: CommandEstimateRecord = {
    command: entry.command,
    args: entry.args,
    model: entry.model,
    junior: humanReadableTime(result.junior),
    senior: humanReadableTime(result.senior),
    juniorMinutes: result.junior,
    seniorMinutes: result.senior,
  };

  writeEstimateEntry(specFolder, cfg, record, "commands");
  return record;
}

export async function evaluateTasks(
  projectRoot: string,
  specFolder: string,
  entry: Pick<TimerEntry, "command" | "args" | "model">,
  tasksContent: string,
): Promise<TaskEstimateRecord[] | null> {
  const cfg = config.load(projectRoot);
  if (!cfg.humanEstimates?.tasks) return null;

  const prompt = buildTasksPrompt(tasksContent);
  const results = (await llmCaller(prompt)) as LlmTaskResult[];
  const list = Array.isArray(results) ? results : [results];

  const records: TaskEstimateRecord[] = list.map((r) => ({
    command: entry.command,
    args: entry.args,
    model: entry.model,
    taskId: r.taskId,
    description: r.description,
    junior: humanReadableTime(r.junior),
    senior: humanReadableTime(r.senior),
    juniorMinutes: r.junior,
    seniorMinutes: r.senior,
  }));

  writeEstimateEntry(specFolder, cfg, records, "tasks");
  return records;
}

/* ─── Storage ─── */

export function writeEstimateEntry(
  specFolder: string,
  cfg: config.AnalyticsConfig,
  data: CommandEstimateRecord | TaskEstimateRecord | TaskEstimateRecord[],
  kind: "commands" | "tasks",
): void {
  const ext = config.getExt(cfg);
  const fmt = config.getFormat(cfg);
  const split =
    cfg.humanEstimates?.splitByCommands && kind === "commands" && !Array.isArray(data);

  let filePath: string;
  if (split) {
    const item = data as CommandEstimateRecord;
    const cmdName = (item.command || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
    filePath = path.join(specFolder, "analytics", "time", "humanEstimates", cmdName + ext);
  } else {
    filePath = path.join(specFolder, "analytics", "time", "humanEstimates", kind + ext);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  if (fmt === "json") {
    writeJsonEstimate(filePath, data, kind);
  } else {
    writeMdEstimate(filePath, data, kind);
  }
}

function writeJsonEstimate(
  filePath: string,
  data: CommandEstimateRecord | TaskEstimateRecord | TaskEstimateRecord[],
  kind: "commands" | "tasks",
): void {
  let existing: unknown[] = [];
  if (fs.existsSync(filePath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as unknown;
      existing = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      existing = [];
    }
  }
  const items = Array.isArray(data) ? data : [data];
  const toWrite =
    kind === "tasks"
      ? items.map((item) => {
          const t = item as TaskEstimateRecord;
          return { taskId: t.taskId, description: t.description, junior: t.junior, senior: t.senior };
        })
      : items;
  existing.push(...toWrite);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
}

function writeMdEstimate(
  filePath: string,
  data: CommandEstimateRecord | TaskEstimateRecord | TaskEstimateRecord[],
  kind: "commands" | "tasks",
): void {
  const items = Array.isArray(data) ? data : [data];

  if (kind === "tasks") {
    const header = `## Task Implementation Projections\n\n| Task ID | Description | Junior | Senior |\n|---|---|---|---|\n`;
    const rows = items
      .map((item) => {
        const t = item as TaskEstimateRecord;
        return `| \`${t.taskId}\` | ${t.description} | \`${t.junior}\` | \`${t.senior}\` |`;
      })
      .join("\n");
    fs.appendFileSync(filePath, header + rows + "\n\n---\n\n", "utf-8");
    return;
  }

  for (const item of items) {
    const lines: string[] = [`## Human Time Estimate`, ``];
    lines.push(`- **Command:** \`${item.command}\``);
    lines.push(`- **Arguments:** \`${item.args}\``);
    lines.push(`- **Model:** \`${item.model}\``);
    lines.push(`- **Junior estimate:** \`${item.junior}\``);
    lines.push(`- **Senior estimate:** \`${item.senior}\``);
    lines.push(``, `---`, ``);
    fs.appendFileSync(filePath, lines.join("\n"), "utf-8");
  }
}
