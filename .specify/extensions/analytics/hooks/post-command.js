#!/usr/bin/env node
/**
 * Post-command hook – invoked by Spec Kit after each command execution.
 */

import * as controller from "../src/controller.ts";
import { resolveProjectRoot } from "../src/config.ts";

const projectRoot = resolveProjectRoot(import.meta.url);
const specFolder = process.env.SPECKIT_SPEC_FOLDER || projectRoot;
const command = process.env.SPECKIT_COMMAND || "unknown";
const args = process.env.SPECKIT_ARGS || "";
const model = process.env.SPECKIT_MODEL || "unknown";

controller
  .postCommand(projectRoot, specFolder, { command, args, model })
  .catch((err) => {
    // Non-blocking – never crash the user's workflow
    if (process.env.SPECKIT_DEBUG) console.error("[spec-kit-analytics]", err);
  });
