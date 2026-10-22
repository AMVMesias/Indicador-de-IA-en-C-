/**
 * Gitignore Manager – appends analytics paths to .gitignore.
 */

import fs from "node:fs";
import path from "node:path";

export const GITIGNORE_ENTRIES: string[] = [
  "# spec-kit-analytics",
  "**/analytics/",
  ".specify/.analytics-timer-state.json",
];

/** Append analytics entries to .gitignore, skipping any already present. */
export function append(projectRoot: string): boolean {
  const gitignorePath = path.join(projectRoot, ".gitignore");
  let content = "";
  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, "utf-8");
  }

  const linesToAdd = GITIGNORE_ENTRIES.filter((e) => !content.includes(e));

  if (linesToAdd.length > 0) {
    const suffix =
      (content.length > 0 && !content.endsWith("\n") ? "\n" : "") +
      "\n" +
      linesToAdd.join("\n") +
      "\n";
    fs.appendFileSync(gitignorePath, suffix, "utf-8");
    return true;
  }
  return false;
}
