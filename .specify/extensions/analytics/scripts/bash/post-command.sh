#!/usr/bin/env bash
# spec-kit-analytics: post-command.sh
# Records the end timestamp and writes the execution timer entry.
#
# Must be run from the project root (the directory containing .specify/).
#
# Usage:
#   .specify/extensions/analytics/scripts/bash/post-command.sh \
#     <spec_folder> <command_name> "<arguments>" "<model>"
#
# Arguments:
#   $1  spec_folder    absolute path to the spec folder (e.g. /path/to/project/specs/001-add-readme)
#   $2  command_name   Spec Kit command (e.g. specify, plan, tasks)
#   $3  arguments      user arguments passed to the command (use "" if none)
#   $4  model          AI model name (use "" if unknown)

SPEC_FOLDER="${1:-$(pwd)}"
COMMAND="${2:-unknown}"
ARGS="${3:-}"
MODEL="${4:-unknown}"

SPECKIT_PROJECT_ROOT="$(pwd)" \
SPECKIT_SPEC_FOLDER="$SPEC_FOLDER" \
SPECKIT_COMMAND="$COMMAND" \
SPECKIT_ARGS="$ARGS" \
SPECKIT_MODEL="$MODEL" \
node --experimental-strip-types --no-warnings=ExperimentalWarning \
  .specify/extensions/analytics/hooks/post-command.js 2>/dev/null || true
