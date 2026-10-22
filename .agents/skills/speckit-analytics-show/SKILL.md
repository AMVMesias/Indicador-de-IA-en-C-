---
name: speckit-analytics-show
description: Display all collected analytics in one summary section
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: spec-kit-analytics
  source: analytics:commands/speckit.analytics.show.md
---

# Analytics: Show

Run the local script.

```powershell
node .specify/extensions/analytics/src/show.ts
```

Run from the project root. Append the spec name or `--all` as a separate argument when provided by the user. Do not interpolate untrusted text into a shell command.
The script reads `<spec>/analytics/time/...` files and prints the report to stdout.
