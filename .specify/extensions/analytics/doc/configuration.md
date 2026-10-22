# Configuration

## Config Files

spec-kit-analytics uses **Spec Kit's native layered config system**. Values are merged from lowest to highest precedence:

| Layer | File | Purpose |
|---|---|---|
| 1 (Defaults) | `extension.yml` (`config.defaults`) | Built-in defaults shipped with the extension |
| 2 (Project) | `.specify/extensions/analytics/analytics-config.yml` | Project-wide settings, committed to git |
| 3 (Local) | `.specify/extensions/analytics/local-config.yml` | Machine-specific overrides, **gitignored** |
| 4 (Env vars) | `SPECKIT_ANALYTICS_<SECTION>_<KEY>` | CI or runtime overrides |

A missing key at any layer falls back to the layer below it. You never need to repeat values you haven't changed.

### Which file should I edit?

- **Team settings** (everyone on the project uses the same values) → edit `analytics-config.yml`
- **Personal preferences** (your machine only, not committed) → create/edit `local-config.yml`
- **CI / automation** → use env vars (see below)

> ⚠️ `analytics-config.yml` is shipped by the extension and **overwritten on extension update**. Keep your personal overrides in `local-config.yml` so they survive updates.

---

## All Options

| Key | Type | Default | Description |
|---|---|---|---|
| `times.splitByCommands` | `boolean` | `false` | Split timer logs into per-command files instead of a single `commands.md` |
| `humanEstimates.commands` | `boolean` | `true` | Enable LLM human-time estimates after every command |
| `humanEstimates.splitByCommands` | `boolean` | `false` | Split estimate logs into per-command files |
| `humanEstimates.tasks` | `boolean` | `true` | Enable task implementation time projection after the `tasks` command |
| `format` | `"markdown" \| "json"` | *(absent → markdown)* | Output format for all generated documents |
| `gitignore` | `boolean` | `false` | Records whether `.gitignore` was updated during installation |

## Default Config (analytics-config.yml)

```yaml
times:
  splitByCommands: false   # true → per-command files under analytics/time/commands/

humanEstimates:
  commands: true           # estimate human time after every command
  splitByCommands: false   # true → per-command estimate files
  tasks: true              # project implementation time after the tasks command

gitignore: false           # true → auto-append analytics folders to .gitignore

# format: markdown         # uncomment and change to "json" for JSON output
```

## Partial Override (local-config.yml example)

You only need to specify the keys you want to change:

```yaml
# .specify/extensions/analytics/local-config.yml
humanEstimates:
  commands: false   # disable LLM estimates on this machine (e.g. no API key)
format: json
```

## Environment Variables

Follow the pattern `SPECKIT_ANALYTICS_<SECTION>_<KEY>` (case-insensitive after the prefix):

| Variable | Equivalent key |
|---|---|
| `SPECKIT_ANALYTICS_FORMAT` | `format` |
| `SPECKIT_ANALYTICS_TIMES_SPLITBYCOMMANDS` | `times.splitByCommands` |
| `SPECKIT_ANALYTICS_HUMANESTIMATES_COMMANDS` | `humanEstimates.commands` |
| `SPECKIT_ANALYTICS_HUMANESTIMATES_TASKS` | `humanEstimates.tasks` |
| `SPECKIT_ANALYTICS_GITIGNORE` | `gitignore` |

---

## Output Format

By default all generated documents are written as **Markdown**. Set `format` to `"json"` to switch every output to JSON.

```yaml
format: json
```

> The `format` key is intentionally absent from the default config. Omitting it is equivalent to `"markdown"`.

### Affected outputs

- Execution timer logs (`analytics/time/commands.md` / `.json`)
- Human time estimate logs (`analytics/time/humanEstimates/commands.md` / `.json`)
- Task projection logs (`analytics/time/humanEstimates/tasks.md` / `.json`)

Both formats carry identical data; only the serialisation changes.

---

## Gitignore Manager

During installation you can opt in to have the following entries appended to your `.gitignore` automatically:

```gitignore
# spec-kit-analytics
**/analytics/
.specify/.analytics-timer-state.json
```

- Only entries **not already present** are appended, safe to run multiple times.
- Controlled by the `gitignore` key, which is set to `true` in the config file once applied.
- **Disabled by default.**

You can also trigger it manually at any time by re-running the installer and selecting yes to the gitignore prompt.
