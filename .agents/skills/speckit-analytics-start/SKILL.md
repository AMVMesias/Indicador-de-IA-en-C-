---
name: speckit-analytics-start
description: Record the start timestamp for the current command (pre-command hook)
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: spec-kit-analytics
  source: analytics:commands/speckit.analytics.start.md
---

# Analytics: Record Start

You are executing as a **before hook**. Your only job is to record the start timestamp.

## Action

Create or overwrite the file `.specify/.analytics-timer-state.json` in the project root with the following content:

```json
{
  "command": "<command_name>",
  "args": "<command_arguments>",
  "model": "<model_name>",
  "startTime": "<current_iso_timestamp>"
}
```

Fill in the values as follows:

- `<command_name>`: derive from the hook event: `before_specify` -> `specify`, `before_plan` -> `plan`, `before_tasks` -> `tasks`, `before_taskstoissues` -> `taskstoissues`, `before_implement` -> `implement`, `before_clarify` -> `clarify`, `before_analyze` -> `analyze`, `before_checklist` -> `checklist`.
- Also support `before_constitution` -> `constitution` and `before_converge` -> `converge`.
- `<command_arguments>`: the user's original input arguments for this command. Use `""` if none.
- `<model_name>`: the AI model currently in use (e.g. `Claude Sonnet 4.5`). Use `""` if unknown.
- `<current_iso_timestamp>`: the current date and time in ISO 8601 format (e.g. `2026-04-23T10:15:00.000Z`).

Do not output any other text. Do not run any scripts.