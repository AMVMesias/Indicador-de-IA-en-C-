/**
 * Configuration system for spec-kit-analytics.
 *
 * Follows the Spec Kit layered config convention (lowest → highest precedence):
 *   1. Defaults       – extension.yml  `config.defaults`
 *   2. Project config – .specify/extensions/analytics/analytics-config.yml  (committed)
 *   3. Local config   – .specify/extensions/analytics/local-config.yml       (gitignored)
 *   4. Env vars       – SPECKIT_ANALYTICS_<SECTION>_<KEY>
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimesConfig {
  splitByCommands: boolean;
}

export interface HumanEstimatesConfig {
  commands: boolean;
  splitByCommands: boolean;
  tasks: boolean;
}

export interface AnalyticsConfig {
  times: TimesConfig;
  humanEstimates: HumanEstimatesConfig;
  gitignore: boolean;
  /** Intentionally absent from defaults – missing value falls back to "markdown". */
  format?: "markdown" | "json";
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const EXTENSION_ID = "analytics";
export const EXTENSION_DIR_NAME = "analytics";

export const DEFAULT_CONFIG: AnalyticsConfig = {
  times: {
    splitByCommands: false,
  },
  humanEstimates: {
    commands: true,
    splitByCommands: false,
    tasks: true,
  },
  gitignore: false,
};

// ---------------------------------------------------------------------------
// Project-root resolution
// ---------------------------------------------------------------------------

/**
 * Walk up from `startPath` until we find the directory that *contains* `.specify`
 * as a direct child but is not itself inside a `.specify` subtree.
 * Falls back to `process.cwd()` if nothing is found.
 */
export function findProjectRoot(startPath: string): string {
  let dir = fs.existsSync(startPath) && fs.statSync(startPath).isDirectory()
    ? startPath
    : path.dirname(startPath);

  while (true) {
    const parent = path.dirname(dir);
    if (path.basename(dir) === ".specify") return parent;
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

/** Resolve project root from the calling module's URL (import.meta.url). */
export function resolveProjectRoot(importMetaUrl: string): string {
  if (process.env["SPECKIT_PROJECT_ROOT"]) return process.env["SPECKIT_PROJECT_ROOT"];
  return findProjectRoot(fileURLToPath(importMetaUrl));
}

/** Absolute path to the extension's directory inside .specify/extensions/. */
export function extensionDir(projectRoot: string): string {
  return path.join(projectRoot, ".specify", "extensions", EXTENSION_DIR_NAME);
}

/** Absolute path to the shipped project-level config file. */
export function projectConfigPath(projectRoot: string): string {
  return path.join(extensionDir(projectRoot), `${EXTENSION_ID}-config.yml`);
}

/** Absolute path to the local (gitignored) override config file. */
export function localConfigPath(projectRoot: string): string {
  return path.join(extensionDir(projectRoot), "local-config.yml");
}

/** @deprecated Use projectConfigPath / localConfigPath instead. */
export function configPath(projectRoot: string): string {
  return projectConfigPath(projectRoot);
}

// ---------------------------------------------------------------------------
// YAML helpers
// ---------------------------------------------------------------------------

function loadYaml(filePath: string): Partial<AnalyticsConfig> {
  if (!fs.existsSync(filePath)) return {};
  try {
    return (yaml.load(fs.readFileSync(filePath, "utf-8")) as Partial<AnalyticsConfig>) ?? {};
  } catch {
    return {};
  }
}

/** Build config overrides from SPECKIT_ANALYTICS_* environment variables. */
function loadEnvConfig(): Partial<AnalyticsConfig> {
  const prefix = "SPECKIT_ANALYTICS_";
  const env: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith(prefix) || value === undefined) continue;
    const parts = key.slice(prefix.length).toLowerCase().split("_");
    let cur = env;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i]!;
      if (typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
      cur = cur[p] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]!] = value;
  }
  return env as Partial<AnalyticsConfig>;
}

// ---------------------------------------------------------------------------
// Deep merge
// ---------------------------------------------------------------------------

/** Deep-merge source into target (source wins). */
export function merge<T extends object>(target: T, source: Partial<T>): T {
  const out = { ...target } as Record<string, unknown>;
  const src = source as Record<string, unknown>;
  const tgt = target as Record<string, unknown>;
  for (const key of Object.keys(src)) {
    const sv = src[key];
    const tv = tgt[key];
    if (
      sv && typeof sv === "object" && !Array.isArray(sv) &&
      tv && typeof tv === "object"
    ) {
      out[key] = merge(tv as object, sv as object);
    } else {
      out[key] = sv;
    }
  }
  return out as T;
}

// ---------------------------------------------------------------------------
// Load / Save
// ---------------------------------------------------------------------------

/**
 * Load the merged config following the Spec Kit layered convention:
 *   defaults → analytics-config.yml → local-config.yml → env vars
 */
export function load(projectRoot: string): AnalyticsConfig {
  let cfg: AnalyticsConfig = { ...DEFAULT_CONFIG };
  cfg = merge(cfg, loadYaml(projectConfigPath(projectRoot)));
  cfg = merge(cfg, loadYaml(localConfigPath(projectRoot)));
  cfg = merge(cfg, loadEnvConfig());
  return cfg;
}

/**
 * Write a config object to the project-level YAML file
 * (.specify/extensions/analytics/analytics-config.yml).
 */
export function save(projectRoot: string, cfg: AnalyticsConfig): void {
  const filePath = projectConfigPath(projectRoot);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, yaml.dump(cfg, { lineWidth: 120 }), "utf-8");
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

/** Get the output format. Falls back to "markdown" when not set. */
export function getFormat(cfg: Pick<AnalyticsConfig, "format">): "markdown" | "json" {
  return cfg.format === "json" ? "json" : "markdown";
}

/** Get file extension for current format. */
export function getExt(cfg: Pick<AnalyticsConfig, "format">): string {
  return getFormat(cfg) === "json" ? ".json" : ".md";
}
