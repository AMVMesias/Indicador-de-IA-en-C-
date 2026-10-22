# Purge Command

The `analytics.purge` command permanently deletes collected analytics data. Use it to free up space, reset your metrics, or start fresh on a spec.

## Usage

```
analytics.purge <spec-name>    Delete analytics for a specific spec
analytics.purge --all          Delete analytics for every spec in the project
```

### Examples

```bash
# Wipe analytics for the spec named "my-feature"
analytics.purge my-feature

# Wipe all analytics across the entire project
analytics.purge --all
```

## What gets deleted

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

## Notes

- The operation is **irreversible**. There is no confirmation prompt.
- Configuration (`.specify/spec-kit-analytics.json`) and source files are never touched.
- Running `analytics.purge --all` only removes `analytics/` sub-folders; it does not affect spec content.
