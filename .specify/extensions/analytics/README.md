# 📊 spec-kit-analytics

[![CI](https://github.com/Fyloss/spec-kit-analytics/actions/workflows/ci.yml/badge.svg)](https://github.com/Fyloss/spec-kit-analytics/actions/workflows/ci.yml)

> **Measure what your AI builds, and how much time it saves you.**

**spec-kit-analytics** is a [Spec Kit](https://github.com/spec-kit) extension that silently collects performance metrics in the background while you work. Every command you run is timed, and an LLM evaluates how long a human would have taken to produce the same result, giving you hard numbers on your productivity gains.

This is **just the beginning**. The analytics story is much bigger than timers and estimates: cost tracking, chat history logging, iteration counts, and a live dashboard are all on the roadmap. We're building the definitive measurement layer for AI-assisted software development, and we're shipping fast. Stay tuned. 🚀

---

## ✨ Features

| Feature | Description |
|---|---|
| **Execution Timer** | Automatic start/end timestamps and readable durations for every command |
| **Human Time Estimator** | LLM-powered estimates of how long a junior & senior dev would take |
| **Task Projection** | After `tasks`, estimates implementation time per task |
| **Format Toggle** | Output in Markdown (default) or JSON |
| **Gitignore Manager** | One-click `.gitignore` protection for analytics data |
| **Purge Command** | Delete analytics for one spec or all at once |
| **Show Command** | Print collected stats. No file opening required |

📖 **[Full documentation →](doc/summary.md)**

---

## 🚀 Installation

```bash
specify extension add spec-kit-analytics
```

That's it. Analytics start collecting immediately with sensible defaults. Edit `.specify/extensions/analytics/analytics-config.yml` to customize.

---

## ⚙️ Configuration

Config file: **`.specify/extensions/analytics/analytics-config.yml`**

```yaml
times:
  splitByCommands: false
humanEstimates:
  commands: true
  splitByCommands: false
  tasks: true
gitignore: false
# format: markdown
```

→ **[Full configuration reference, format toggle & gitignore manager](doc/configuration.md)**

---

## 📁 Analytics Output Structure

```
<spec-folder>/
  analytics/
    time/
      commands.md              # (or .json, or commands/<name>.md if splitByCommands)
      humanEstimates/
        commands.md            # Per-command human time estimates
        tasks.md               # Task implementation time projections
```

---

## 🧹 Purge Command

```
analytics.purge <spec-name>  # Delete analytics for a specific spec
analytics.purge --all        # Delete all analytics across the project
```

→ **[Purge command docs](doc/purge-command.md)**

---

## 👀 Show Command

A pure local renderer. Print collected stats.

```
analytics.show <spec-name>   # Print stats for a specific spec
analytics.show --all         # Print stats for every spec, with project totals
analytics.show               # Same as --all
```


→ **[Show command docs](doc/show-command.md)**

---

## 🗺️ TODO / Roadmap

- [ ] **Interactive setup wizard**: a guided configuration prompt at install time. Requires an `on_install` hook in Spec Kit itself (not yet available); we may propose this upstream.
- [ ] **Cost calculations** based on model usage (token counts × pricing).
- [ ] **Chat history logging** divided by commands.
- [ ] **Iterations count tracking**: number of messages/commands to the agent per session.
- [ ] **Metrics visualization**: a command to create a lightweight dashboard.

---

## 📄 License

MIT

---
