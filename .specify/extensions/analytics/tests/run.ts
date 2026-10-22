/**
 * Acceptance Tests for spec-kit-analytics
 *
 * Run: node tests/run.ts
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import * as config from "../src/config.ts";
import * as timer from "../src/timer.ts";
import * as estimator from "../src/estimator.ts";
import * as purge from "../src/purge.ts";
import * as gitignore from "../src/gitignore.ts";
import * as show from "../src/show.ts";

/* ─── harness ─── */

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${name}`);
    console.log(`     ${(err as Error).message}`);
  }
}

async function testAsync(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${name}`);
    console.log(`     ${(err as Error).message}`);
  }
}

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ska-test-"));
}

function rmrf(dir: string): void {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

/* ─── tests ─── */

async function run(): Promise<void> {
  console.log("\n🧪 spec-kit-analytics acceptance tests\n");

  /* ─── Config ─── */
  console.log("── Config ──");

  test("DEFAULT_CONFIG has times.splitByCommands = false", () => {
    assert.strictEqual(config.DEFAULT_CONFIG.times.splitByCommands, false);
  });

  test("DEFAULT_CONFIG has humanEstimates.commands = true", () => {
    assert.strictEqual(config.DEFAULT_CONFIG.humanEstimates.commands, true);
  });

  test("DEFAULT_CONFIG has humanEstimates.splitByCommands = false", () => {
    assert.strictEqual(config.DEFAULT_CONFIG.humanEstimates.splitByCommands, false);
  });

  test("DEFAULT_CONFIG has humanEstimates.tasks = true", () => {
    assert.strictEqual(config.DEFAULT_CONFIG.humanEstimates.tasks, true);
  });

  test("DEFAULT_CONFIG does NOT have format key", () => {
    assert.strictEqual(config.DEFAULT_CONFIG.format, undefined);
  });

  test("load() returns defaults when no config file exists", () => {
    const tmp = makeTmpDir();
    const cfg = config.load(tmp);
    assert.strictEqual(cfg.times.splitByCommands, false);
    assert.strictEqual(cfg.humanEstimates.commands, true);
    rmrf(tmp);
  });

  test("load() merges user overrides with defaults", () => {
    const tmp = makeTmpDir();
    const extDir = path.join(tmp, ".specify", "extensions", "analytics");
    fs.mkdirSync(extDir, { recursive: true });
    fs.writeFileSync(
      path.join(extDir, "analytics-config.yml"),
      "times:\n  splitByCommands: true\nformat: json\n",
    );
    const cfg = config.load(tmp);
    assert.strictEqual(cfg.times.splitByCommands, true);
    assert.strictEqual(cfg.format, "json");
    assert.strictEqual(cfg.humanEstimates.commands, true); // from defaults
    rmrf(tmp);
  });

  test("save() creates config file at correct path", () => {
    const tmp = makeTmpDir();
    config.save(tmp, config.DEFAULT_CONFIG);
    assert.ok(fs.existsSync(path.join(tmp, ".specify", "extensions", "analytics", "analytics-config.yml")));
    rmrf(tmp);
  });

  test("getFormat() returns markdown when format is missing", () => {
    assert.strictEqual(config.getFormat({}), "markdown");
  });

  test("getFormat() returns json when format is json", () => {
    assert.strictEqual(config.getFormat({ format: "json" }), "json");
  });

  /* ─── Timer ─── */
  console.log("\n── Timer ──");

  test("formatDuration formats seconds", () => {
    assert.strictEqual(timer.formatDuration(5000), "5s");
  });

  test("formatDuration formats minutes and seconds", () => {
    assert.strictEqual(timer.formatDuration(73000), "1m 13s");
  });

  test("formatDuration formats hours", () => {
    assert.strictEqual(timer.formatDuration(3661000), "1h 1m 1s");
  });

  test("recordStart creates state file", () => {
    const tmp = makeTmpDir();
    timer.recordStart(tmp, "plan", "build an API", "Claude Opus 4.6");
    assert.ok(fs.existsSync(timer.statePath(tmp)));
    rmrf(tmp);
  });

  test("recordEnd writes Markdown log and removes state", () => {
    const tmp = makeTmpDir();
    const specFolder = path.join(tmp, ".specify", "specs", "my-spec");
    fs.mkdirSync(specFolder, { recursive: true });
    config.save(tmp, config.DEFAULT_CONFIG);
    fs.mkdirSync(path.join(tmp, ".specify"), { recursive: true });
    const start = new Date(Date.now() - 73000).toISOString();
    fs.writeFileSync(
      timer.statePath(tmp),
      JSON.stringify({ command: "plan", args: "build API", model: "Claude Opus 4.6", startTime: start }),
    );
    const entry = timer.recordEnd(tmp, specFolder);
    assert.ok(entry);
    assert.strictEqual(entry.command, "plan");
    const logPath = path.join(specFolder, "analytics", "time", "commands.md");
    assert.ok(fs.existsSync(logPath), "commands.md should exist");
    const content = fs.readFileSync(logPath, "utf-8");
    assert.ok(content.includes("**Command:** `plan`"));
    assert.ok(content.includes("**Duration:**"));
    assert.ok(!fs.existsSync(timer.statePath(tmp)));
    rmrf(tmp);
  });

  test("recordEnd writes JSON log when format is json", () => {
    const tmp = makeTmpDir();
    const specFolder = path.join(tmp, ".specify", "specs", "my-spec");
    fs.mkdirSync(specFolder, { recursive: true });
    config.save(tmp, { ...config.DEFAULT_CONFIG, format: "json" });
    const start = new Date(Date.now() - 5000).toISOString();
    fs.mkdirSync(path.join(tmp, ".specify"), { recursive: true });
    fs.writeFileSync(
      timer.statePath(tmp),
      JSON.stringify({ command: "implement", args: "auth", model: "GPT-4", startTime: start }),
    );
    timer.recordEnd(tmp, specFolder);
    const logPath = path.join(specFolder, "analytics", "time", "commands.json");
    assert.ok(fs.existsSync(logPath), "commands.json should exist");
    const data = JSON.parse(fs.readFileSync(logPath, "utf-8")) as unknown[];
    assert.ok(Array.isArray(data));
    assert.strictEqual((data[0] as { command: string }).command, "implement");
    rmrf(tmp);
  });

  test("splitByCommands creates per-command file", () => {
    const tmp = makeTmpDir();
    const specFolder = path.join(tmp, ".specify", "specs", "s1");
    fs.mkdirSync(specFolder, { recursive: true });
    config.save(tmp, { ...config.DEFAULT_CONFIG, times: { splitByCommands: true } });
    const start = new Date(Date.now() - 2000).toISOString();
    fs.mkdirSync(path.join(tmp, ".specify"), { recursive: true });
    fs.writeFileSync(
      timer.statePath(tmp),
      JSON.stringify({ command: "plan", args: "", model: "M", startTime: start }),
    );
    timer.recordEnd(tmp, specFolder);
    const logPath = path.join(specFolder, "analytics", "time", "commands", "plan.md");
    assert.ok(fs.existsSync(logPath), "plan.md should exist in commands/");
    rmrf(tmp);
  });

  /* ─── Estimator (mocked LLM) ─── */
  console.log("\n── Estimator (mocked LLM) ──");

  test("humanReadableTime formats correctly", () => {
    assert.strictEqual(estimator.humanReadableTime(0), "1m");
    assert.strictEqual(estimator.humanReadableTime(45), "45m");
    assert.strictEqual(estimator.humanReadableTime(150), "2h 30m");
    assert.strictEqual(estimator.humanReadableTime(1573), "1d 2h 13m");
  });

  test("buildCommandPrompt includes command and model", () => {
    const p = estimator.buildCommandPrompt("plan", "build API", "Claude Opus 4.6", "# Plan\nDo stuff");
    assert.ok(p.includes("plan"));
    assert.ok(p.includes("Claude Opus 4.6"));
    assert.ok(p.includes("# Plan"));
  });

  test("buildTasksPrompt includes tasks content", () => {
    const p = estimator.buildTasksPrompt("T001: Build auth\nT002: Build DB");
    assert.ok(p.includes("T001"));
    assert.ok(p.includes("T002"));
  });

  await testAsync("evaluateCommand writes Markdown estimate with mocked LLM", async () => {
    const tmp = makeTmpDir();
    const specFolder = path.join(tmp, "spec1");
    fs.mkdirSync(specFolder, { recursive: true });
    config.save(tmp, config.DEFAULT_CONFIG);

    estimator.setLlmCaller(async () => ({ junior: 120, senior: 45 }));

    const entry = { command: "plan", args: "build API", model: "Claude Opus 4.6" };
    const result = await estimator.evaluateCommand(tmp, specFolder, entry, "# Plan content");
    assert.ok(result);
    assert.strictEqual(result.junior, "2h");
    assert.strictEqual(result.senior, "45m");

    const filePath = path.join(specFolder, "analytics", "time", "humanEstimates", "commands.md");
    assert.ok(fs.existsSync(filePath));
    const content = fs.readFileSync(filePath, "utf-8");
    assert.ok(content.includes("**Junior estimate:**"));
    assert.ok(content.includes("`2h`"));
    rmrf(tmp);
  });

  await testAsync("evaluateTasks writes task projections with mocked LLM", async () => {
    const tmp = makeTmpDir();
    const specFolder = path.join(tmp, "spec1");
    fs.mkdirSync(specFolder, { recursive: true });
    config.save(tmp, config.DEFAULT_CONFIG);

    estimator.setLlmCaller(async () => [
      { taskId: "T001", description: "Build auth module", junior: 480, senior: 180 },
      { taskId: "T002", description: "Write tests", junior: 240, senior: 90 },
    ]);

    const entry = { command: "tasks", args: "implement auth", model: "Claude Opus 4.6" };
    const results = await estimator.evaluateTasks(tmp, specFolder, entry, "T001: Build auth\nT002: Write tests");
    assert.ok(Array.isArray(results));
    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].taskId, "T001");
    assert.strictEqual(results[0].junior, "8h");

    const filePath = path.join(specFolder, "analytics", "time", "humanEstimates", "tasks.md");
    assert.ok(fs.existsSync(filePath));
    const content = fs.readFileSync(filePath, "utf-8");
    assert.ok(content.includes("T001"));
    assert.ok(content.includes("T002"));
    rmrf(tmp);
  });

  await testAsync("evaluateCommand writes JSON when format is json", async () => {
    const tmp = makeTmpDir();
    const specFolder = path.join(tmp, "spec1");
    fs.mkdirSync(specFolder, { recursive: true });
    config.save(tmp, { ...config.DEFAULT_CONFIG, format: "json" });

    estimator.setLlmCaller(async () => ({ junior: 60, senior: 30 }));

    const entry = { command: "analyze", args: "stuff", model: "M" };
    await estimator.evaluateCommand(tmp, specFolder, entry, "content");

    const filePath = path.join(specFolder, "analytics", "time", "humanEstimates", "commands.json");
    assert.ok(fs.existsSync(filePath));
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as unknown[];
    assert.ok(Array.isArray(data));
    assert.strictEqual((data[0] as { juniorMinutes: number }).juniorMinutes, 60);
    rmrf(tmp);
  });

  /* ─── Purge ─── */
  console.log("\n── Purge ──");

  test("purgeSpec removes analytics folder", () => {
    const tmp = makeTmpDir();
    const specFolder = path.join(tmp, "spec1");
    const analyticsDir = path.join(specFolder, "analytics", "time");
    fs.mkdirSync(analyticsDir, { recursive: true });
    fs.writeFileSync(path.join(analyticsDir, "commands.md"), "data");
    assert.ok(purge.purgeSpec(specFolder));
    assert.ok(!fs.existsSync(path.join(specFolder, "analytics")));
    rmrf(tmp);
  });

  test("purgeAll removes analytics in all spec folders", () => {
    const tmp = makeTmpDir();
    const specsRoot = path.join(tmp, ".specify", "specs");
    for (const name of ["s1", "s2"]) {
      const dir = path.join(specsRoot, name, "analytics");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "data.md"), "x");
    }
    const count = purge.purgeAll(tmp);
    assert.strictEqual(count, 2);
    assert.ok(!fs.existsSync(path.join(specsRoot, "s1", "analytics")));
    rmrf(tmp);
  });

  test("execute with --all purges everything", () => {
    const tmp = makeTmpDir();
    const dir = path.join(tmp, ".specify", "specs", "s1", "analytics");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "x.md"), "y");
    const result = purge.execute(tmp, "--all") as { purged: "all"; count: number };
    assert.strictEqual(result.purged, "all");
    assert.strictEqual(result.count, 1);
    rmrf(tmp);
  });

  test("execute with spec name purges that spec", () => {
    const tmp = makeTmpDir();
    const dir = path.join(tmp, ".specify", "specs", "myspec", "analytics");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "x.md"), "y");
    const result = purge.execute(tmp, "myspec") as { purged: string; success: boolean };
    assert.strictEqual(result.purged, "myspec");
    assert.strictEqual(result.success, true);
    rmrf(tmp);
  });

  /* ─── Show ─── */
  console.log("\n── Show ──");

  test("parseDuration parses '1h 2m 3s'", () => {
    assert.strictEqual(show.parseDuration("1h 2m 3s"), 3_723_000);
    assert.strictEqual(show.parseDuration("45m"), 2_700_000);
    assert.strictEqual(show.parseDuration("5s"), 5_000);
    assert.strictEqual(show.parseDuration(""), 0);
  });

  test("parseDuration supports days emitted by humanReadableTime", () => {
    // humanReadableTime(1573) → "1d 2h 13m" (see estimator test).
    // parseDuration must round-trip the same magnitude in milliseconds.
    assert.strictEqual(show.parseDuration("1d 2h 13m"), 94_380_000);
    assert.strictEqual(show.parseDuration("2d"), 172_800_000);
    assert.strictEqual(show.parseDuration("1d"), 86_400_000);
  });

  test("formatMs round-trips with parseDuration", () => {
    assert.strictEqual(show.formatMs(show.parseDuration("1h 2m 3s")), "1h 2m 3s");
    assert.strictEqual(show.formatMs(show.parseDuration("45m")), "45m");
  });

  test("formatMs round-trips day-scale durations", () => {
    assert.strictEqual(show.formatMs(show.parseDuration("1d 2h 13m")), "1d 2h 13m");
    assert.strictEqual(show.formatMs(show.parseDuration("2d")), "2d");
  });

  test("execute returns empty result when no specs exist", () => {
    const tmp = makeTmpDir();
    const outcome = show.execute(tmp, "");
    assert.ok(outcome.ok);
    if (!outcome.ok) throw new Error("unreachable");
    assert.strictEqual(outcome.result.specs.length, 0);
    assert.ok(outcome.rendered.includes("No analytics data"));
    rmrf(tmp);
  });

  test("execute reads markdown timer + estimates for a single spec", () => {
    const tmp = makeTmpDir();
    const specFolder = path.join(tmp, ".specify", "specs", "feat-x");
    fs.mkdirSync(specFolder, { recursive: true });
    config.save(tmp, config.DEFAULT_CONFIG);

    // Write a timer entry via the real writer to lock the test on the writer's format.
    fs.mkdirSync(path.join(tmp, ".specify"), { recursive: true });
    const start = new Date(Date.now() - 73000).toISOString();
    fs.writeFileSync(
      timer.statePath(tmp),
      JSON.stringify({ command: "plan", args: "build API", model: "Claude Opus 4.6", startTime: start }),
    );
    timer.recordEnd(tmp, specFolder);

    // Estimator entry written via the real writer too (mocked LLM).
    estimator.setLlmCaller(async () => ({ junior: 120, senior: 45 }));

    const outcome = show.execute(tmp, "feat-x");
    assert.ok(outcome.ok);
    if (!outcome.ok) throw new Error("unreachable");
    const [s] = outcome.result.specs;
    assert.ok(s);
    assert.strictEqual(s.spec, "feat-x");
    assert.strictEqual(s.timers.length, 1);
    assert.strictEqual(s.timers[0]!.command, "plan");
    assert.ok(outcome.rendered.includes("feat-x"));
    assert.ok(outcome.rendered.includes("plan"));
    rmrf(tmp);
  });

  await testAsync("execute reads JSON sources when format is json", async () => {
    const tmp = makeTmpDir();
    const specFolder = path.join(tmp, ".specify", "specs", "json-spec");
    fs.mkdirSync(specFolder, { recursive: true });
    config.save(tmp, { ...config.DEFAULT_CONFIG, format: "json" });

    fs.mkdirSync(path.join(tmp, ".specify"), { recursive: true });
    fs.writeFileSync(
      timer.statePath(tmp),
      JSON.stringify({
        command: "implement",
        args: "auth",
        model: "Claude Opus 4.6",
        startTime: new Date(Date.now() - 5000).toISOString(),
      }),
    );
    timer.recordEnd(tmp, specFolder);

    estimator.setLlmCaller(async () => ({ junior: 60, senior: 30 }));
    await estimator.evaluateCommand(
      tmp,
      specFolder,
      { command: "implement", args: "auth", model: "Claude Opus 4.6" },
      "content",
    );

    const outcome = show.execute(tmp, "json-spec");
    assert.ok(outcome.ok);
    if (!outcome.ok) throw new Error("unreachable");
    const [s] = outcome.result.specs;
    assert.ok(s);
    assert.strictEqual(s.timers.length, 1);
    assert.strictEqual(s.commandEstimates.length, 1);
    assert.strictEqual(s.commandEstimates[0]!.juniorMinutes, 60);
    rmrf(tmp);
  });

  test("execute derives minutes when JSON task estimates omit them", () => {
    // The JSON writer for tasks intentionally stores only {taskId, description, junior, senior}
    // (see estimator.writeJsonEstimate). Without normalization on read, juniorMinutes/seniorMinutes
    // are undefined and totals/rendering produce NaN.
    const tmp = makeTmpDir();
    const specFolder = path.join(tmp, ".specify", "specs", "json-tasks");
    const dir = path.join(specFolder, "analytics", "time", "humanEstimates");
    fs.mkdirSync(dir, { recursive: true });
    config.save(tmp, { ...config.DEFAULT_CONFIG, format: "json" });

    fs.writeFileSync(
      path.join(dir, "tasks.json"),
      JSON.stringify([
        { taskId: "T001", description: "Build auth", junior: "8h", senior: "3h" },
        { taskId: "T002", description: "Write tests", junior: "1d 2h", senior: "4h" },
      ]),
    );

    const outcome = show.execute(tmp, "json-tasks");
    assert.ok(outcome.ok);
    if (!outcome.ok) throw new Error("unreachable");
    const [s] = outcome.result.specs;
    assert.ok(s);
    assert.strictEqual(s.taskEstimates.length, 2);
    assert.strictEqual(s.taskEstimates[0]!.juniorMinutes, 480);
    assert.strictEqual(s.taskEstimates[0]!.seniorMinutes, 180);
    assert.strictEqual(s.taskEstimates[1]!.juniorMinutes, 1560); // 1d 2h = 1440 + 120
    assert.ok(!outcome.rendered.includes("NaN"), "rendered output must not contain NaN");
    rmrf(tmp);
  });

  test("execute aggregates totals across all specs when no spec is targeted", () => {
    const tmp = makeTmpDir();
    config.save(tmp, config.DEFAULT_CONFIG);

    for (const name of ["s1", "s2"]) {
      const specFolder = path.join(tmp, ".specify", "specs", name);
      fs.mkdirSync(specFolder, { recursive: true });
      fs.mkdirSync(path.join(tmp, ".specify"), { recursive: true });
      fs.writeFileSync(
        timer.statePath(tmp),
        JSON.stringify({
          command: "plan",
          args: "x",
          model: "M",
          startTime: new Date(Date.now() - 60_000).toISOString(),
        }),
      );
      timer.recordEnd(tmp, specFolder);
    }

    const outcome = show.execute(tmp, "");
    assert.ok(outcome.ok);
    if (!outcome.ok) throw new Error("unreachable");
    assert.strictEqual(outcome.result.specs.length, 2);
    assert.ok(outcome.result.totals.realMs >= 100_000); // 2 × ~60s, allow rounding slack
    assert.ok(outcome.rendered.includes("Project totals"));
    rmrf(tmp);
  });

  test("execute returns empty list for an unknown spec name", () => {
    const tmp = makeTmpDir();
    const outcome = show.execute(tmp, "does-not-exist");
    assert.ok(outcome.ok);
    if (!outcome.ok) throw new Error("unreachable");
    assert.strictEqual(outcome.result.specs.length, 0);
    rmrf(tmp);
  });

  test("execute rejects path traversal in spec name", () => {
    // gather() did `path.join(root, target)` with no validation, so a target like
    // "../escaped" would resolve outside <projectRoot>/specs/ and expose any folder
    // sitting next to specs/ as if it were a spec.
    const tmp = makeTmpDir();
    const escaped = path.join(tmp, "escaped");
    fs.mkdirSync(path.join(escaped, "analytics", "time"), { recursive: true });
    fs.writeFileSync(path.join(escaped, "analytics", "time", "commands.md"), "x");

    for (const target of ["../escaped", "../../escaped", "foo/bar", ".", ".."]) {
      const outcome = show.execute(tmp, target);
      assert.ok(outcome.ok);
      if (!outcome.ok) throw new Error("unreachable");
      assert.strictEqual(
        outcome.result.specs.length,
        0,
        `target "${target}" must not escape the specs root`,
      );
    }
    rmrf(tmp);
  });

  test("execute does not show misleading '1m' totals when no estimates exist", () => {
    // humanReadableTime(0) clamps to "1m". Without guarding the project-totals
    // footer, a multi-spec view with timers but no estimates would print
    // "junior: 1m   senior: 1m" — fabricated values, not real data.
    const tmp = makeTmpDir();
    config.save(tmp, config.DEFAULT_CONFIG);

    for (const name of ["s1", "s2"]) {
      const specFolder = path.join(tmp, ".specify", "specs", name);
      fs.mkdirSync(specFolder, { recursive: true });
      fs.mkdirSync(path.join(tmp, ".specify"), { recursive: true });
      fs.writeFileSync(
        timer.statePath(tmp),
        JSON.stringify({
          command: "plan",
          args: "x",
          model: "M",
          startTime: new Date(Date.now() - 60_000).toISOString(),
        }),
      );
      timer.recordEnd(tmp, specFolder);
    }

    const outcome = show.execute(tmp, "");
    assert.ok(outcome.ok);
    if (!outcome.ok) throw new Error("unreachable");
    assert.ok(outcome.rendered.includes("Project totals"));
    assert.ok(
      !/Estimated human time/.test(outcome.rendered),
      "must not render the 'Estimated human time' line when no estimates exist",
    );
    rmrf(tmp);
  });

  test("readTimerFiles ignores subdirectories under commands/", () => {
    // fs.readdirSync(splitDir) returned plain names; readFileSync on a
    // directory whose name happened to end in ".md" would throw EISDIR
    // and abort the whole show command.
    const tmp = makeTmpDir();
    const specFolder = path.join(tmp, ".specify", "specs", "with-subdir");
    const commandsDir = path.join(specFolder, "analytics", "time", "commands");
    fs.mkdirSync(commandsDir, { recursive: true });
    fs.mkdirSync(path.join(commandsDir, "stale-leftover.md"));
    fs.mkdirSync(path.join(commandsDir, "stale-leftover.json"));
    fs.writeFileSync(
      path.join(commandsDir, "plan.md"),
      "## Command Execution\n\n**Command:** `plan`\n**Arguments:** ``\n**Model:** ``\n**Start:** ``\n**End:** ``\n**Duration:** `5s`\n",
    );

    const outcome = show.execute(tmp, "with-subdir");
    assert.ok(outcome.ok);
    if (!outcome.ok) throw new Error("unreachable");
    const [s] = outcome.result.specs;
    assert.ok(s);
    assert.strictEqual(s.timers.length, 1);
    assert.strictEqual(s.timers[0]!.command, "plan");
    rmrf(tmp);
  });

  /* ─── Gitignore ─── */
  console.log("\n── Gitignore ──");

  test("append creates .gitignore with entries", () => {
    const tmp = makeTmpDir();
    gitignore.append(tmp);
    const content = fs.readFileSync(path.join(tmp, ".gitignore"), "utf-8");
    assert.ok(content.includes("**/analytics/"));
    assert.ok(content.includes(".specify/.analytics-timer-state.json"));
    rmrf(tmp);
  });

  test("append does not duplicate entries", () => {
    const tmp = makeTmpDir();
    gitignore.append(tmp);
    gitignore.append(tmp);
    const content = fs.readFileSync(path.join(tmp, ".gitignore"), "utf-8");
    const count = (content.match(/\*\*\/analytics\//g) ?? []).length;
    assert.strictEqual(count, 1, "Entry should appear only once");
    rmrf(tmp);
  });

  /* ─── Summary ─── */
  console.log(`\n${"═".repeat(40)}`);
  console.log(`  Total: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  console.log(`${"═".repeat(40)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run();
