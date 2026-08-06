import path from "node:path";
import { execa } from "execa";
import {
  ensureDir,
  exists,
  removePath,
  writeJson,
  writeText,
  readJson,
} from "./lib/fs.ts";
import { appDir, resultDir } from "./lib/paths.ts";
import { buildAppName, shortModelLabel } from "./lib/naming.ts";
import { elapsedSeconds, nowIso } from "./lib/time.ts";
import { getHarness } from "./harness/index.ts";
import {
  buildPhasePrompt,
  getTask,
  multiAgentHint,
} from "./tasks/load.ts";
import { scanStructural } from "./score/structural.ts";
import { autoScore } from "./score/auto.ts";
import { runRuntimeChecks } from "./runtime/checks.ts";
import { writeRunReport, rebuildLeaderboard } from "./report/markdown.ts";
import type {
  HarnessId,
  ModelRole,
  PhaseResult,
  RunMeta,
  RunStatus,
} from "./types/index.ts";

export interface RunOptions {
  task: string;
  harness: HarnessId;
  models: ModelRole[];
  timeoutMinutes?: number;
  force?: boolean;
  skipScaffold?: boolean;
  skipRuntime?: boolean;
  phase?: "build" | "validate" | "both";
  dryRun?: boolean;
  runSlug?: string;
  runIndex?: number;
  campaign?: string;
  controls?: Record<string, string>;
}

export async function runBenchmark(opts: RunOptions): Promise<RunMeta> {
  const task = getTask(opts.task);
  const harness = getHarness(opts.harness);
  const timeoutMinutes = opts.timeoutMinutes ?? 90;
  const phase = opts.phase ?? "both";

  const appName = buildAppName({
    taskId: task.id,
    harness: opts.harness,
    models: opts.models,
    runIndex: opts.runIndex,
    customSlug: opts.runSlug,
  });
  const slug = appName;
  const appPath = appDir(appName);
  const resPath = resultDir(slug);

  if ((await exists(path.join(resPath, "result.json"))) && !opts.force) {
    throw new Error(
      `Result already exists for ${slug}. Pass --force to overwrite.`,
    );
  }

  await ensureDir(resPath);
  await ensureDir(appPath);

  const meta: RunMeta = {
    id: crypto.randomUUID(),
    slug,
    appName,
    taskId: task.id,
    harness: opts.harness,
    models: opts.models,
    status: "pending",
    startedAt: nowIso(),
    appDir: appPath,
    resultDir: resPath,
    phases: [],
    notes: [],
    campaign: opts.campaign,
    controls: opts.controls,
  };

  await persist(meta);

  if (opts.dryRun) {
    meta.status = "not_run";
    meta.notes?.push("dry-run: no harness invoked");
    meta.finishedAt = nowIso();
    meta.elapsedSeconds = elapsedSeconds(meta.startedAt);
    await persist(meta);
    await writeRunReport(meta);
    await rebuildLeaderboard();
    return meta;
  }

  // scaffold
  if (!opts.skipScaffold) {
    meta.status = "scaffolding";
    await persist(meta);
    const scaffolded = await maybeScaffold(appPath, task.scaffold.command);
    meta.notes?.push(
      scaffolded
        ? `scaffold: ran \`${task.scaffold.command}\``
        : "scaffold: skipped (app already has package.json)",
    );
  }

  const modelsLabel = shortModelLabel(opts.models);
  const maHint = multiAgentHint(opts.models);

  // BUILD phase
  if (phase === "build" || phase === "both") {
    const buildPrompt = await buildPhasePrompt(task, "build", {
      appName,
      appDir: appPath,
      modelsLabel,
      multiAgentHint: maHint,
    });
    await writeText(path.join(resPath, "prompt.build.md"), buildPrompt);

    meta.status = "running";
    await persist(meta);

    const phaseRes = await runPhase({
      name: "build",
      harnessId: opts.harness,
      cwd: appPath,
      prompt: buildPrompt,
      models: opts.models,
      timeoutMs: timeoutMinutes * 60_000,
      logFile: path.join(resPath, "build.log"),
    });
    meta.phases.push(phaseRes);

    if (phaseRes.status === "timeout") {
      meta.status = "timeout";
      meta.error = "build phase timed out";
      return finalize(meta);
    }
    if (phaseRes.status === "failed") {
      meta.status = "failed";
      meta.error = phaseRes.error ?? "build phase failed";
      // still try structural/score for partial credit
    }
  }

  // VALIDATE phase (agent-driven) — optional companion to our own runtime checks
  if (phase === "validate" || phase === "both") {
    const validatePrompt = await buildPhasePrompt(task, "validate", {
      appName,
      appDir: appPath,
      modelsLabel,
      multiAgentHint: maHint,
    });
    await writeText(path.join(resPath, "prompt.validate.md"), validatePrompt);

    // Only invoke harness validate if build didn't hard-fail with empty tree
    const hasPkg = await exists(path.join(appPath, "package.json"));
    if (hasPkg && phase !== "validate") {
      // For "both", runtime checks below are the source of truth;
      // still allow a short agent validate if harness is not manual handoff-only.
      // Skip automatic second harness call for handoff harnesses to avoid double wait.
      if (opts.harness === "claude-code" || opts.harness === "codex") {
        const phaseRes = await runPhase({
          name: "validate",
          harnessId: opts.harness,
          cwd: appPath,
          prompt: validatePrompt,
          models: opts.models,
          timeoutMs: Math.min(timeoutMinutes, 45) * 60_000,
          logFile: path.join(resPath, "validate.log"),
        });
        meta.phases.push(phaseRes);
      } else {
        await writeText(
          path.join(resPath, "validate.handoff.md"),
          validatePrompt,
        );
        meta.notes?.push(
          "validate prompt written (prime-agent/manual — outer loop or --phase validate)",
        );
      }
    } else if (phase === "validate") {
      const phaseRes = await runPhase({
        name: "validate",
        harnessId: opts.harness,
        cwd: appPath,
        prompt: validatePrompt,
        models: opts.models,
        timeoutMs: timeoutMinutes * 60_000,
        logFile: path.join(resPath, "validate.log"),
      });
      meta.phases.push(phaseRes);
    }
  }

  // Remember hard failures from phases before we overwrite status.
  const phaseHardFail = meta.phases.some(
    (p) => p.status === "timeout" || p.status === "failed",
  );
  const phaseTimedOut = meta.phases.some((p) => p.status === "timeout");

  // Structural + runtime + score
  meta.status = "validating";
  await persist(meta);

  meta.structural = await scanStructural(appPath);

  if (!opts.skipRuntime) {
    meta.runtime = await runRuntimeChecks(appPath, {
      skipDocker: process.env.BENCH_SKIP_DOCKER === "1",
    });
  }

  meta.status = "scoring";
  await persist(meta);
  meta.scores = await autoScore({
    appDir: appPath,
    structural: meta.structural,
    runtime: meta.runtime,
  });

  // final status
  const runtimeOk = meta.runtime?.allPassed ?? false;
  const hasCore =
    meta.structural.present.package_json &&
    meta.structural.stack.dockerCompose;
  if (phaseTimedOut) {
    meta.status = "timeout";
  } else if (phaseHardFail && !hasCore) {
    meta.status = "failed";
  } else if (runtimeOk && (meta.scores?.total ?? 0) >= 60) {
    meta.status = "completed";
  } else if (hasCore) {
    meta.status = "completed_with_errors";
  } else if ((meta.scores?.total ?? 0) > 0) {
    meta.status = "completed_with_errors";
  } else {
    meta.status = "failed";
  }

  return finalize(meta);
}

async function finalize(meta: RunMeta) {
  meta.finishedAt = nowIso();
  meta.elapsedSeconds = elapsedSeconds(meta.startedAt, meta.finishedAt);
  await persist(meta);
  await writeRunReport(meta);
  await rebuildLeaderboard();
  return meta;
}

async function persist(meta: RunMeta) {
  await writeJson(path.join(meta.resultDir, "result.json"), meta);
}

async function runPhase(opts: {
  name: "build" | "validate";
  harnessId: HarnessId;
  cwd: string;
  prompt: string;
  models: ModelRole[];
  timeoutMs: number;
  logFile: string;
}): Promise<PhaseResult> {
  const harness = getHarness(opts.harnessId);
  const startedAt = nowIso();
  const available = await harness.isAvailable();
  if (!available && opts.harnessId !== "manual") {
    return {
      name: opts.name,
      status: "failed",
      startedAt,
      finishedAt: nowIso(),
      elapsedSeconds: 0,
      error: `harness ${opts.harnessId} not available on PATH`,
      logFile: opts.logFile,
    };
  }

  const result = await harness.run({
    cwd: opts.cwd,
    prompt: opts.prompt,
    models: opts.models,
    timeoutMs: opts.timeoutMs,
    logFile: opts.logFile,
  });

  const finishedAt = nowIso();
  const status: PhaseResult["status"] = result.timedOut
    ? "timeout"
    : result.exitCode === 0
      ? "completed"
      : "failed";

  return {
    name: opts.name,
    status,
    startedAt,
    finishedAt,
    elapsedSeconds: elapsedSeconds(startedAt, finishedAt),
    exitCode: result.exitCode,
    logFile: opts.logFile,
    tokens: result.tokens,
    toolCalls: result.toolCalls,
    error:
      status === "failed"
        ? `exit ${result.exitCode}`
        : status === "timeout"
          ? "timed out"
          : undefined,
  };
}

async function maybeScaffold(appPath: string, command: string) {
  if (await exists(path.join(appPath, "package.json"))) return false;

  // Keep bench metadata files; remove nothing else yet.
  const result = await execa("bash", ["-lc", command], {
    cwd: appPath,
    reject: false,
    all: true,
    timeout: 10 * 60_000,
    env: {
      ...process.env,
      CI: "1",
      FORCE_COLOR: "0",
      npm_config_yes: "true",
    },
  });

  // shadcn `init -n app` creates a nested ./app (or ./start-app) directory.
  // Hoist it so package.json lands at appPath root (the agent workspace).
  const hoistCandidates = ["app", "start-app", "web"];
  let hoisted: string | undefined;
  for (const name of hoistCandidates) {
    const nested = path.join(appPath, name);
    if (await exists(path.join(nested, "package.json"))) {
      // Move nested contents up
      const mv = await execa(
        "bash",
        [
          "-lc",
          [
            `shopt -s dotglob`,
            `mv "${name}"/* .`,
            `rmdir "${name}" 2>/dev/null || rm -rf "${name}"`,
          ].join(" && "),
        ],
        { cwd: appPath, reject: false, all: true },
      );
      hoisted = `${name} (mv exit ${mv.exitCode})`;
      break;
    }
  }

  const log = [
    `# scaffold`,
    `cwd: ${appPath}`,
    `cmd: ${command}`,
    `exit: ${result.exitCode}`,
    `timedOut: ${result.timedOut ?? false}`,
    `hoisted: ${hoisted ?? "none"}`,
    `packageJson: ${await exists(path.join(appPath, "package.json"))}`,
    "",
    result.all ?? "",
  ].join("\n");
  await writeText(path.join(appPath, ".bench-scaffold.log"), log);

  if ((result.all ?? "").includes("What is your project named?")) {
    throw new Error(
      "Scaffold prompted for project name (interactive). Use shadcn -n <name> --yes --force.",
    );
  }
  if (!(await exists(path.join(appPath, "package.json")))) {
    throw new Error(
      `Scaffold finished without package.json at ${appPath}. See .bench-scaffold.log`,
    );
  }
  return result.exitCode === 0;
}

export async function scoreExisting(slug: string, opts?: { skipRuntime?: boolean }) {
  const resPath = resultDir(slug);
  const resultPath = path.join(resPath, "result.json");
  if (!(await exists(resultPath))) {
    throw new Error(`No result.json for slug ${slug}`);
  }
  const meta = await readJson<RunMeta>(resultPath);
  meta.structural = await scanStructural(meta.appDir);
  if (!opts?.skipRuntime) {
    meta.runtime = await runRuntimeChecks(meta.appDir, {
      skipDocker: process.env.BENCH_SKIP_DOCKER === "1",
    });
  }
  meta.scores = await autoScore({
    appDir: meta.appDir,
    structural: meta.structural,
    runtime: meta.runtime,
  });
  meta.status = "completed_with_errors";
  if (meta.runtime?.allPassed && (meta.scores.total ?? 0) >= 60) {
    meta.status = "completed";
  }
  meta.finishedAt = nowIso();
  await persist(meta);
  await writeRunReport(meta);
  await rebuildLeaderboard();
  return meta;
}

export async function resetRun(slug: string) {
  const resPath = resultDir(slug);
  const metaPath = path.join(resPath, "result.json");
  if (await exists(metaPath)) {
    const meta = await readJson<RunMeta>(metaPath);
    if (meta.appDir && (await exists(meta.appDir))) {
      await removePath(meta.appDir);
    }
  }
  if (await exists(resPath)) await removePath(resPath);
}
