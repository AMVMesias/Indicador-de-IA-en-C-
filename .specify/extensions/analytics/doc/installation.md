# Installation & Setup

## 1. Install the Extension

```bash
specify extension add spec-kit-analytics
```

The extension is immediately active. All lifecycle hooks are registered and analytics start collecting with default settings on the next Spec Kit command.

---

## 2. Configure (Optional)

### Option A: Edit the Config File Directly

Open `.specify/extensions/analytics/analytics-config.yml` and change any value:

```yaml
times:
  splitByCommands: false

humanEstimates:
  commands: true
  splitByCommands: false
  tasks: true

gitignore: false
# format: markdown   # uncomment and set to "json" to switch output format
```

### Option B: Personal Overrides (gitignored, survives extension updates)

Create `.specify/extensions/analytics/local-config.yml` with only the keys you want to override:

```yaml
# personal settings, not committed, not overwritten on extension update
humanEstimates:
  commands: false   # e.g. you don't have an LLM API key locally
```

See [configuration.md](configuration.md) for the full config reference and environment variable support.

---

## How the Config Layers Work

Values are merged from lowest → highest precedence:

```
extension defaults  ←  analytics-config.yml  ←  local-config.yml  ←  env vars
```

You only need to set the keys you want to change; everything else falls back automatically.

> ⚠️ `analytics-config.yml` is overwritten when the extension is updated. Use `local-config.yml` for any settings you don't want lost on update.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `SPECKIT_PROJECT_ROOT` | Override project root path (set automatically by Spec Kit) |
| `SPECKIT_ANALYTICS_FORMAT` | `format`: `markdown` or `json` |
| `SPECKIT_ANALYTICS_HUMANESTIMATES_COMMANDS` | `humanEstimates.commands` |
| `SPECKIT_ANALYTICS_HUMANESTIMATES_TASKS` | `humanEstimates.tasks` |
| `SPECKIT_ANALYTICS_TIMES_SPLITBYCOMMANDS` | `times.splitByCommands` |
