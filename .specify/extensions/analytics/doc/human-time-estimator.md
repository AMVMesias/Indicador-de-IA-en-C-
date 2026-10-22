# Human Time Estimator

## Overview

After each Spec Kit command runs, an LLM evaluates how long a human would have taken to produce the same output. Two developer profiles are always measured: **junior** (1–2 years experience) and **senior** (5+ years experience).

---

## Mode 1: Command Generation

Triggered after **every** command. The LLM receives the generated document and estimates the full effort including thinking, writing, and self-review.

**Storage:** `<spec>/analytics/time/humanEstimates/commands.md`  
(or per-command files when `humanEstimates.splitByCommands` is `true`)

### Output example (Markdown)

```markdown
## Human Time Estimate

- **Command:** `analyze`
- **Arguments:** `create a simple todo app`
- **Model:** `Claude Opus 4.6`
- **Junior estimate:** `1h 30m`
- **Senior estimate:** `25m`

---
```

### Output example (JSON)

```json
[
  {
    "command": "analyze",
    "args": "create a simple todo app",
    "model": "Claude Opus 4.6",
    "junior": "1h 30m",
    "senior": "25m",
    "juniorMinutes": 90,
    "seniorMinutes": 25
  }
]
```

---

## Mode 2: Tasks Implementation Projection

Triggered only after the **`tasks`** command. The LLM reads the generated `tasks.md` and estimates the implementation effort for each individual task, including thinking, coding, and self-review.

**Storage:** `<spec>/analytics/time/humanEstimates/tasks.md`

### Output example (Markdown)

```markdown
## Task Implementation Projections

| Task ID | Description | Junior | Senior |
|---|---|---|---|
| `T001` | Set up project structure and dependencies | `2h 30m` | `45m` |
| `T002` | Implement user authentication module | `1d 2h` | `3h 30m` |
| `T003` | Write unit tests for auth module | `3h` | `1h 15m` |

---
```

### Output example (JSON)

```json
[
  { "taskId": "T001", "description": "Set up project structure and dependencies", "junior": "2h 30m", "senior": "45m" },
  { "taskId": "T002", "description": "Implement user authentication module", "junior": "1d 2h", "senior": "3h 30m" },
  { "taskId": "T003", "description": "Write unit tests for auth module", "junior": "3h", "senior": "1h 15m" }
]
```

---

## Time Formatting Rules

- Minimum granularity: **1 minute** (seconds are never shown).
- Format: `Xd Yh Zm` (zero-valued leading units are omitted).
- Examples: `45m`, `2h 30m`, `1d 4h`, `3h`.

---

## Configuration

| Key | Default | Effect |
|---|---|---|
| `humanEstimates.commands` | `true` | Enable/disable command generation estimates |
| `humanEstimates.tasks` | `true` | Enable/disable task projection |
| `humanEstimates.splitByCommands` | `false` | Write a separate file per command name instead of one `commands.md` |

See [configuration.md](configuration.md) for the full reference.

---

## LLM Prompts

The prompts instruct the model to reply with **pure JSON only**: `{"junior": N, "senior": N}` for command generation, or a JSON array for task projection. See `src/estimator.ts` for the full prompt text.
