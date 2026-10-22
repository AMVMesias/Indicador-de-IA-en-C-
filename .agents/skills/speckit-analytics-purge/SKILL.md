---
name: speckit-analytics-purge
description: Delete collected analytics data for a specific spec or for all specs
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: spec-kit-analytics
  source: analytics:commands/speckit.analytics.purge.md
---

# Analytics: Purge

Delete all collected analytics data. Use this to free up space, reset metrics, or start fresh.

## Usage

To purge analytics for a specific spec:

```bash
SPECKIT_PROJECT_ROOT="<project_root>" \
  node -e "import('./.specify/extensions/spec-kit-analytics/src/purge.ts').then(m => m.execute('<project_root>', '<spec_name>'))"
```

To purge analytics for all specs:

```bash
SPECKIT_PROJECT_ROOT="<project_root>" \
  node -e "import('./.specify/extensions/spec-kit-analytics/src/purge.ts').then(m => m.execute('<project_root>', '--all'))"
```

Ask the user whether they want to purge a specific spec or all specs before running.

## What Gets Deleted

The `analytics/` folder inside the target spec directory is removed entirely:

```
<spec-folder>/
  analytics/        ← this whole folder is deleted
    time/
      commands.md
      humanEstimates/
        commands.md
        tasks.md
```

## Graceful Degradation

- If the target folder does not exist: skip with a confirmation message.
- Configuration and spec content files are never touched.