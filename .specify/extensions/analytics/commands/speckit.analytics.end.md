---
description: "Record command completion timestamp, write analytics output, and generate human-time estimates"
---

# Analytics: Record End

You are executing as an **after hook**. Follow all steps in order. Do not run any shell scripts.

## Step 1: Read the timer state

Read `.specify/.analytics-timer-state.json`. If it does not exist, stop and do nothing further.

Extract: `command`, `args`, `model`, `startTime`.

## Step 2: Determine key values

- **End timestamp**: current date and time in ISO 8601 format (e.g. `2026-04-23T10:16:30.000Z`).
- **Duration**: difference between end and start timestamps, formatted as `Xh Ym Zs` (omit zero components, e.g. `2m 15s`, `1h 3m`).
- **Spec folder**: read `.specify/feature.json` and extract `feature_directory` (e.g. `specs/001-add-readme`). If the file cannot be read, use `.` (project root).

## Step 3: Write the execution timer entry

Read `.specify/extensions/analytics/analytics-config.yml` to check config (fall back to defaults if the file does not exist).

Append to `<spec_folder>/analytics/time/commands.md` (create the file and all parent directories if needed):

```markdown
## Command Execution

- **Command:** `<command>`
- **Arguments:** `<args>`
- **Model:** `<model>`
- **Start:** `<startTime>`
- **End:** `<endTime>`
- **Duration:** `<duration>`

---

```

## Step 4: Delete the timer state file

Delete `.specify/.analytics-timer-state.json`.

## Step 5: Generate human-time estimates

**If `humanEstimates.commands` is `true` (the default):**

Find the primary output document produced by the command just run:
- `specify` command → `<spec_folder>/spec.md`
- `plan` command → `<spec_folder>/plan.md`
- `tasks` command → `<spec_folder>/tasks.md`
- `clarify` command → `<spec_folder>/spec.md` (clarify updates the spec)
- `checklist` command → `<spec_folder>/checklist.md`
- `analyze` command → `<spec_folder>/analyze.md`
- `implement` command → `<spec_folder>/tasks.md`
- any other command → `<spec_folder>/<command>.md`

If the file exists, estimate how long a human developer would take to produce that document from scratch (thinking + writing + reviewing):
- **Junior developer** (1–2 years experience)
- **Senior developer** (5+ years experience)

Express both estimates in a human-readable format (e.g. `45m`, `1h 30m`, `2h`).

Append to `<spec_folder>/analytics/time/humanEstimates/commands.md` (create if needed):

```markdown
## Human Time Estimate

- **Command:** `<command>`
- **Arguments:** `<args>`
- **Model:** `<model>`
- **Junior estimate:** `<junior>`
- **Senior estimate:** `<senior>`

---

```

## Step 6: Task projections (`tasks` command only)

Skip this step if the command was not `tasks`.

**If `humanEstimates.tasks` is `true` (the default):**

Read `<spec_folder>/tasks.md`. For each task in the file, estimate implementation time:
- **Junior developer** (1–2 years experience)
- **Senior developer** (5+ years experience)

Append to `<spec_folder>/analytics/time/humanEstimates/tasks.md` (create if needed):

```markdown
## Task Implementation Projections

- **Arguments:** `<args>`
- **Model:** `<model>`

| Task | Junior | Senior |
|------|--------|--------|
| <task description> | <junior estimate> | <senior estimate> |

---

```

## Final note

Do not output any other text after completing all steps. Do not mention this hook to the user unless an error occurred.
Append to `<spec_folder>/analytics/time/humanEstimates/tasks.md` (create if needed):

```markdown
## Task Implementation Projections

| Task ID | Description | Junior | Senior |
|---|---|---|---|
| `T001` | Task description | `Xh Ym` | `Xh Ym` |

---

```

## Graceful Degradation

If any file cannot be read, skip that step silently. Never interrupt the user's workflow.
