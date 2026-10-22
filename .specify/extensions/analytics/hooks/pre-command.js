#!/usr/bin/env node
/**
 * Pre-command hook – invoked by Spec Kit before each command execution.
 *
 * Expected environment / arguments:
 *   SPECKIT_PROJECT_ROOT – project root path
 *   SPECKIT_COMMAND      – the command being run (e.g. plan, implement)
 *   SPECKIT_ARGS         – command arguments
 *   SPECKIT_MODEL        – model name
 */

import * as controller from "../src/controller.ts";
import { resolveProjectRoot } from "../src/config.ts";

const projectRoot = resolveProjectRoot(import.meta.url);
const command = process.env.SPECKIT_COMMAND || "unknown";
const args = process.env.SPECKIT_ARGS || "";
const model = process.env.SPECKIT_MODEL || "unknown";

controller.preCommand(projectRoot, { command, args, model });
