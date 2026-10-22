/**
 * Purge command – deletes analytics data.
 */

import fs from "node:fs";
import path from "node:path";

function purgeFolder(dir: string): boolean {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    return true;
  }
  return false;
}

/** Purge analytics for a single spec folder. */
export function purgeSpec(specFolder: string): boolean {
  return purgeFolder(path.join(specFolder, "analytics"));
}

/** Purge analytics for all spec folders under projectRoot/.specify/specs/. */
export function purgeAll(projectRoot: string): number {
  const specsRoot = path.join(projectRoot, ".specify", "specs");
  let count = 0;
  if (fs.existsSync(specsRoot)) {
    for (const entry of fs.readdirSync(specsRoot, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (purgeSpec(path.join(specsRoot, entry.name))) count++;
      }
    }
  }
  return count;
}

export type PurgeResult =
  | { purged: "all"; count: number }
  | { purged: string; success: boolean }
  | { purged: null; error: string };

/** Main purge handler called by the controller. */
export function execute(projectRoot: string, args: string): PurgeResult {
  if (args === "--all" || args === "all") {
    return { purged: "all", count: purgeAll(projectRoot) };
  }
  if (args && args !== "") {
    const specFolder = path.join(projectRoot, ".specify", "specs", args);
    return { purged: args, success: purgeSpec(specFolder) };
  }
  return { purged: null, error: "No spec folder specified. Use --all or provide a spec name." };
}
