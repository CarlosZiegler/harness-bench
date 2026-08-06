#!/usr/bin/env bun
import { Command } from "commander";
import chalk from "chalk";
import { listHarnesses } from "../harness/index.ts";
import { listTasks, getTask } from "../tasks/load.ts";
import { runBenchmark, scoreExisting, resetRun } from "../runner.ts";
import { rebuildLeaderboard } from "../report/markdown.ts";
import type { HarnessId, ModelRole, RunMeta } from "../types/index.ts";
import { formatDuration } from "../lib/time.ts";
import { PRESETS, parseModelsArg } from "../config/presets.ts";

const program = new Command();

program
  .name("harness-bench")
  .description(
    "Benchmark coding harnesses (Prime Agent, Claude Code, Codex) on fullstack web tasks",
  )
  .version("0.1.0");

program
  .command("tasks")
  .description("List available benchmark tasks")
  .action(() => {
    for (const t of listTasks()) {
      console.log(
        `${chalk.cyan(t.id.padEnd(14))} ${chalk.bold(t.title)}\n  ${t.summary}\n  stack: ${t.stack.join(", ")}\n`,
      );
    }
  });

program
  .command("harnesses")
  .description("List harness adapters and availability")
  .action(async () => {
    for (const h of listHarnesses()) {
      const ok = await h.isAvailable();
      console.log(
        `${ok ? chalk.green("●") : chalk.red("○")} ${h.id.padEnd(14)} ${h.label}`,
      );
    }
  });

program
  .command("presets")
  .description("List model/harness presets (including SOL+Luna)")
  .action(() => {
    for (const [id, p] of Object.entries(PRESETS)) {
      console.log(
        `${chalk.cyan(id.padEnd(28))} harness=${p.harness} models=${p.models.map((m) => `${m.role}:${m.id}`).join(",")}`,
      );
      if (p.notes) console.log(`  ${chalk.dim(p.notes)}`);
    }
  });

program
  .command("run")
  .description("Run a benchmark")
  .requiredOption("-t, --task <id>", "Task id (pulseboard|launchpad)")
  .option(
    "-H, --harness <id>",
    "Harness: prime-agent|grok-cli|claude-code|codex|manual",
    "prime-agent",
  )
  .option(
    "-m, --models <spec>",
    'Models spec. Examples: "grok-4.5" or "planner:gpt-5.6-sol-xhigh,executor:gpt-5.6-luna-xhigh"',
  )
  .option("-p, --preset <name>", "Preset from `harness-bench presets`")
  .option("--slug <slug>", "Custom app/run slug")
  .option("--timeout-minutes <n>", "Timeout minutes", "90")
  .option("--phase <phase>", "build|validate|both", "both")
  .option("--skip-scaffold", "Do not run shadcn init", false)
  .option("--skip-runtime", "Skip install/build/docker checks", false)
  .option("--force", "Overwrite existing result", false)
  .option("--dry-run", "Create meta + prompts only", false)
  .action(async (opts) => {
    try {
      getTask(opts.task);
    } catch (e) {
      console.error(chalk.red((e as Error).message));
      process.exit(1);
    }

    let harness = opts.harness as HarnessId;
    let models: ModelRole[] | undefined;

    let campaign: string | undefined;
    let controls: Record<string, string> | undefined;

    if (opts.preset) {
      const preset = PRESETS[opts.preset];
      if (!preset) {
        console.error(
          chalk.red(
            `Unknown preset ${opts.preset}. Run: bun run bench -- presets`,
          ),
        );
        process.exit(1);
      }
      harness = preset.harness;
      models = preset.models;
      campaign = preset.campaign;
      controls = preset.controls;
    }

    if (opts.models) {
      models = parseModelsArg(opts.models);
    }

    if (!models?.length) {
      console.error(
        chalk.red("Provide --models or --preset. Example: --models grok-4.5"),
      );
      process.exit(1);
    }

    console.log(chalk.bold("\nHarness Bench — run"));
    console.log(`  task:     ${opts.task}`);
    console.log(`  harness:  ${harness}`);
    console.log(
      `  models:   ${models.map((m) => `${m.role}:${m.id}${m.effort ? "@" + m.effort : ""}`).join(", ")}`,
    );
    if (campaign) console.log(`  campaign: ${campaign}`);
    console.log(`  phase:    ${opts.phase}`);
    console.log(`  timeout:  ${opts.timeoutMinutes}m\n`);

    const meta = await runBenchmark({
      task: opts.task,
      harness,
      models,
      timeoutMinutes: Number(opts.timeoutMinutes),
      force: Boolean(opts.force),
      skipScaffold: Boolean(opts.skipScaffold),
      skipRuntime: Boolean(opts.skipRuntime),
      phase: opts.phase,
      dryRun: Boolean(opts.dryRun),
      runSlug: opts.slug,
      campaign,
      controls,
    });

    console.log(chalk.bold("\nDone"));
    console.log(`  slug:    ${meta.slug}`);
    console.log(`  status:  ${meta.status}`);
    console.log(
      `  score:   ${meta.scores ? `${meta.scores.total}/100 (Tier ${meta.scores.tier})` : "—"}`,
    );
    console.log(
      `  elapsed: ${meta.elapsedSeconds != null ? formatDuration(meta.elapsedSeconds) : "—"}`,
    );
    console.log(`  app:     ${meta.appDir}`);
    console.log(`  result:  ${meta.resultDir}/result.json`);
    console.log(`  report:  ${meta.resultDir}/report.md\n`);
  });

program
  .command("score")
  .description("Re-scan + score an existing run slug")
  .requiredOption("--slug <slug>", "Run slug")
  .option("--skip-runtime", "Skip runtime checks", false)
  .action(async (opts) => {
    const meta = await scoreExisting(opts.slug, {
      skipRuntime: Boolean(opts.skipRuntime),
    });
    console.log(
      `${meta.slug}: ${meta.scores?.total}/100 tier ${meta.scores?.tier} (${meta.status})`,
    );
  });

program
  .command("report")
  .description("Rebuild docs/leaderboard.md from results/")
  .action(async () => {
    await rebuildLeaderboard();
    console.log("Wrote docs/leaderboard.md");
  });

program
  .command("reset")
  .description("Delete app + results for a slug")
  .requiredOption("--slug <slug>", "Run slug")
  .action(async (opts) => {
    await resetRun(opts.slug);
    console.log(`Reset ${opts.slug}`);
  });

program
  .command("compare")
  .description("Print a side-by-side table for two or more slugs")
  .argument("<slugs...>", "Result slugs")
  .action(async (slugs: string[]) => {
    const { readJson, exists } = await import("../lib/fs.ts");
    const { resultDir } = await import("../lib/paths.ts");
    const rows: RunMeta[] = [];
    for (const s of slugs) {
      const p = `${resultDir(s)}/result.json`;
      if (!(await exists(p))) {
        console.error(chalk.red(`missing ${p}`));
        process.exit(1);
      }
      rows.push(await readJson(p));
    }
    console.log(
      "slug".padEnd(42),
      "harness".padEnd(14),
      "total".padStart(5),
      "FE".padStart(4),
      "BE".padStart(4),
      "Ops".padStart(4),
      "Qual".padStart(5),
      "time".padStart(8),
      "status",
    );
    for (const r of rows) {
      console.log(
        r.slug.slice(0, 42).padEnd(42),
        r.harness.padEnd(14),
        String(r.scores?.total ?? "—").padStart(5),
        String(r.scores?.frontendSubscore ?? "—").padStart(4),
        String(r.scores?.backendSubscore ?? "—").padStart(4),
        String(r.scores?.devopsSubscore ?? "—").padStart(4),
        String(r.scores?.codeQualitySubscore ?? "—").padStart(5),
        (r.elapsedSeconds != null
          ? formatDuration(r.elapsedSeconds)
          : "—"
        ).padStart(8),
        r.status,
      );
    }
  });

program.parseAsync(process.argv);
