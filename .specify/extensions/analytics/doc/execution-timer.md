# Execution Timer

## How It Works

1. **Pre-command hook** writes a state file (`.specify/.analytics-timer-state.json`) with the start timestamp, command name, arguments, and model.
2. **Post-command hook** reads the state, captures the end timestamp, calculates duration, writes the log entry, and deletes the state file.

## Output Location

| `times.splitByCommands` | Path |
|---|---|
| `false` (default) | `<spec>/analytics/time/commands.md` |
| `true` | `<spec>/analytics/time/commands/<command>.md` |

## Markdown Output Example

```markdown
## Command Execution

- **Command:** `/speckit.analyze`
- **Arguments:** `create a simple toto`
- **Model:** `Claude Opus 4.6`
- **Start:** `2026-04-21T10:00:00.000Z`
- **End:** `2026-04-21T10:01:13.000Z`
- **Duration:** `1m 13s`

---
```

## JSON Output Example

```json
[
  {
    "command": "/speckit.analyze",
    "args": "create a simple toto",
    "model": "Claude Opus 4.6",
    "startTime": "2026-04-21T10:00:00.000Z",
    "endTime": "2026-04-21T10:01:13.000Z",
    "duration": "1m 13s"
  }
]
```
