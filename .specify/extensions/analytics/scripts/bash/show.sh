#!/usr/bin/env bash
# spec-kit-analytics: show.sh
# Renders collected analytics for one spec or the whole project, straight to stdout.
# Runs locally — no LLM call.
#
# Defaults to the current working directory as project root. Override by
# exporting SPECKIT_PROJECT_ROOT before invocation, which lets the script run
# from anywhere (including a subdirectory).
#
# Usage:
#   .specify/extensions/analytics/scripts/bash/show.sh                # all specs
#   .specify/extensions/analytics/scripts/bash/show.sh <spec_name>    # one spec
#   .specify/extensions/analytics/scripts/bash/show.sh --all          # explicit all

set -eu

ARG="${1:-}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SHOW_TS="$SCRIPT_DIR/../../src/show.ts"

SPECKIT_PROJECT_ROOT="${SPECKIT_PROJECT_ROOT:-$(pwd)}" \
  node --experimental-strip-types --no-warnings=ExperimentalWarning \
  "$SHOW_TS" "$ARG"
