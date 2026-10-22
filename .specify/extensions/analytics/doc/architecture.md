# Hooks & Controller Architecture

## Design Principle

All hook scripts are thin wrappers that delegate to the **main controller** (`src/controller.ts`). This keeps the hooks minimal and all logic centralized.

## Flow

```
Spec Kit ──▶ hooks/pre-command.js ──▶ controller.preCommand()
                                          └──▶ timer.recordStart()

Spec Kit ──▶ hooks/post-command.js ──▶ controller.postCommand()
                                          ├──▶ timer.recordEnd()
                                          ├──▶ estimator.evaluateCommand()
                                          └──▶ estimator.evaluateTasks()  (if tasks cmd)
```

## Modules

| Module | Responsibility |
|---|---|
| `src/controller.ts` | Orchestration, command registration |
| `src/config.ts` | Load/save/merge config, format helpers |
| `src/timer.ts` | Start/end state management, duration formatting, log writing |
| `src/estimator.ts` | LLM prompt building, evaluation runners, estimate storage |
| `src/purge.ts` | Analytics folder deletion |
| `src/gitignore.ts` | `.gitignore` append logic |
| `src/install.ts` | Interactive CLI setup |
