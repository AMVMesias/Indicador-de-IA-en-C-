# Show Command

Print collected analytics for one spec — or for the whole project. Pure local rendering.

## Usage

### Inside Claude Code

```
/speckit.analytics.show <spec-name>
/speckit.analytics.show --all
/speckit.analytics.show
```

The slash command resolves to a single Bash invocation of the underlying script, so the LLM only spends a handful of tokens on dispatch.

**Tip — bypass the LLM entirely.** Prefix the script with `!` in Claude Code; the harness runs the command directly in your shell without consulting the model:

```
! ./.specify/extensions/analytics/scripts/bash/show.sh <spec-name>
```

GitHub Copilot, Cursor Chat, Continue and similar assistants do not have an equivalent of `!` — every message there routes through the LLM. For a zero-token run with those tools, just open your IDE's integrated terminal (without the chat panel) and run the script directly.

### Outside Claude Code (terminal, CI, scripts)

Run the bash script directly from the project root (the directory containing `.specify/`):

```bash
./.specify/extensions/analytics/scripts/bash/show.sh <spec-name>
./.specify/extensions/analytics/scripts/bash/show.sh --all
./.specify/extensions/analytics/scripts/bash/show.sh
```

If you call it from a subdirectory, point it at the project root explicitly:

```bash
SPECKIT_PROJECT_ROOT="/abs/path/to/project" \
  /abs/path/to/project/.specify/extensions/analytics/scripts/bash/show.sh <spec-name>
```

Zero setup, zero token cost — useful in CI, cron jobs, or any non-interactive context.

## What gets printed

For each spec, up to three sections are rendered (a section is omitted if it has no data):

1. **⏱  Execution Timer** — one line per recorded command, with the cumulated real time.
2. **👤 Human Time Estimates (per command)** — junior and senior estimates per command, with totals.
3. **📋 Task Projections** — junior and senior estimates per task, with totals.

When more than one spec is rendered, a **Σ Project totals** footer is appended with:

- Real execution time across the project.
- Total estimated human time (junior / senior).
- Time saved against both junior and senior baselines.

## Sample output

```
📊 spec-kit-analytics

📁 Spec: demo-feat
────────────────────────────────────────────────────────────
⏱  Execution Timer
  • plan "demo"  →  1m 13s  [Claude Opus 4.7]
  • tasks "demo"  →  12s    [Claude Opus 4.7]
  Σ total: 1m 25s

👤 Human Time Estimates (per command)
  • plan   →  junior 4h, senior 1h 30m
  • tasks  →  junior 4h, senior 1h 30m
  Σ junior: 8h   senior: 3h

📋 Task Projections
  • T001  Build auth   →  junior 8h, senior 3h
  • T002  Write tests  →  junior 4h, senior 1h 30m
  Σ junior: 12h   senior: 4h 30m
```

## Data sources

Both Markdown and JSON storage formats are supported transparently. The renderer reads whatever exists under:

```
<spec-folder>/analytics/time/commands.{md,json}
<spec-folder>/analytics/time/commands/<name>.{md,json}        (splitByCommands)
<spec-folder>/analytics/time/humanEstimates/commands.{md,json}
<spec-folder>/analytics/time/humanEstimates/<name>.{md,json}  (splitByCommands)
<spec-folder>/analytics/time/humanEstimates/tasks.{md,json}
```

## Notes

- Read-only: the show command never writes to disk and never modifies analytics files.
- If no analytics exist yet, a friendly hint is printed.
- If a spec name is passed but does not match any folder, an empty result is rendered (no error).
