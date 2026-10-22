# Contributing to spec-kit-analytics

## Requirements

- **Node.js 24** (see `.nvmrc`): the project runs TypeScript natively (no build step needed).
- **TypeScript 5.9.3** and **@types/node 24.12.2** (pinned, dev-only, for type-checking and editor support).

## Installation (dev)

```bash
git clone <repo>
cd spec-kit-analytics
npm install
```

## Running Tests

```bash
npm test
```

Tests live in `tests/run.ts` and run directly against the TypeScript sources. The LLM caller is fully mocked, no API credits are spent.

## Type-checking

```bash
npm run typecheck
```

`tsconfig.json` is set to `"noEmit": true`: it validates types only, no output is produced.

## Project Structure

```
spec-kit-analytics/
├── src/
│   ├── config.ts        # Config loading, merging, defaults
│   ├── controller.ts    # Main orchestrator & Spec Kit command registration
│   ├── estimator.ts     # LLM human-time estimator (injectable LLM caller)
│   ├── gitignore.ts     # .gitignore append manager
│   ├── purge.ts         # analytics.purge command logic
│   └── timer.ts         # Execution timer (pre/post hook state management)
├── hooks/
│   ├── pre-command.js   # Spec Kit preCommand hook → controller.preCommand()
│   └── post-command.js  # Spec Kit postCommand hook → controller.postCommand()
├── tests/
│   └── run.ts           # Acceptance test suite (29 tests, zero deps)
├── doc/                 # Feature documentation
├── package.json
└── tsconfig.json
```

## Architecture

See [architecture.md](architecture.md) for the hook flow and module responsibilities.

## Extension Lifecycle Hooks

The `speckit` field in `package.json` wires the extension into Spec Kit:

```json
"speckit": {
  "hooks": {
    "preCommand":  "hooks/pre-command.js",
    "postCommand": "hooks/post-command.js"
  }
}
```

- **`preCommand` / `postCommand`**: called transparently by Spec Kit around every user command.

## Adding a Feature

1. Implement logic in a new or existing `src/*.ts` module.
2. Wire it through `src/controller.ts` if it needs to run on a hook.
3. Add acceptance tests to `tests/run.ts`.
4. Update the relevant doc in `doc/`.
