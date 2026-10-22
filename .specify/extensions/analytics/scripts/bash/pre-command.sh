#!/usr/bin/env bash
# spec-kit-analytics: pre-command.sh
# Records the start timestamp for the current Spec Kit command.
#
# Must be run from the project root (the directory containing .specify/).
#
# Usage:
#   .specify/extensions/analytics/scripts/bash/pre-command.sh \
#     <command_name> "<arguments>" "<model>"
#
# Arguments:
#   $1  command_name   Spec Kit command (e.g. specify, plan, tasks)
#   $2  arguments      user arguments passed to the command (use "" if none)
#   $3  model          AI model name (use "" if unknown)

COMMAND="${1:-unknown}"
ARGS="${2:-}"
MODEL="${3:-unknown}"

SPECKIT_PROJECT_ROOT="$(pwd)" \
SPECKIT_COMMAND="$COMMAND" \
SPECKIT_ARGS="$ARGS" \
SPECKIT_MODEL="$MODEL" \
node --experimental-strip-types --no-warnings=ExperimentalWarning \
  .specify/extensions/analytics/hooks/pre-command.js 2>/dev/null || true
