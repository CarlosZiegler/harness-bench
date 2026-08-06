import { z } from "zod";

export const HarnessIdSchema = z.enum([
  "prime-agent",
  "grok-cli",
  "claude-code",
  "codex",
  "manual",
]);
export type HarnessId = z.infer<typeof HarnessIdSchema>;

export const ModelRoleSchema = z.object({
  role: z.enum(["solo", "planner", "executor"]),
  id: z.string(),
  label: z.string().optional(),
  /**
   * Reasoning / thinking effort. Fair fights must pin the same value on both sides.
   * Grok CLI: --effort high|medium|low
   * Prime Agent: --thinking high|medium|low|...
   */
  effort: z.string().optional(),
  /** Provider hint for harnesses that need it (e.g. prime-agent --provider xai) */
  provider: z.string().optional(),
});
export type ModelRole = z.infer<typeof ModelRoleSchema>;

export const RunConfigSchema = z.object({
  task: z.string(),
  harness: HarnessIdSchema,
  runSlug: z.string().optional(),
  models: z.array(ModelRoleSchema).min(1),
  timeoutMinutes: z.number().int().positive().default(90),
  force: z.boolean().default(false),
  skipScaffold: z.boolean().default(false),
  skipRuntime: z.boolean().default(false),
  phase: z.enum(["build", "validate", "both"]).default("both"),
  dryRun: z.boolean().default(false),
});
export type RunConfig = z.infer<typeof RunConfigSchema>;

export type RunStatus =
  | "pending"
  | "scaffolding"
  | "running"
  | "validating"
  | "scoring"
  | "completed"
  | "completed_with_errors"
  | "failed"
  | "timeout"
  | "not_run";

export interface RunMeta {
  id: string;
  slug: string;
  appName: string;
  taskId: string;
  harness: HarnessId;
  models: ModelRole[];
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  elapsedSeconds?: number;
  appDir: string;
  resultDir: string;
  phases: PhaseResult[];
  runtime?: RuntimeResult;
  structural?: StructuralScan;
  scores?: Scorecard;
  cost?: CostEstimate;
  error?: string;
  notes?: string[];
  /** Campaign / fair-fight metadata */
  campaign?: string;
  controls?: Record<string, string>;
}

export interface PhaseResult {
  name: "build" | "validate";
  status: "completed" | "failed" | "timeout" | "skipped";
  startedAt: string;
  finishedAt?: string;
  elapsedSeconds?: number;
  exitCode?: number | null;
  logFile?: string;
  tokens?: { input?: number; output?: number; total?: number };
  toolCalls?: number;
  error?: string;
}

export interface RuntimeCheck {
  id: string;
  label: string;
  ok: boolean;
  detail?: string;
  elapsedMs?: number;
}

export interface RuntimeResult {
  checks: RuntimeCheck[];
  allPassed: boolean;
  screenshotDir?: string;
}

export interface StructuralScan {
  present: Record<string, boolean>;
  counts: {
    files: number;
    tsxFiles: number;
    testFiles: number;
    routes: number;
    components: number;
  };
  stack: {
    tanstackStart: boolean;
    drizzle: boolean;
    betterAuth: boolean;
    shadcn: boolean;
    reui: boolean;
    postgres: boolean;
    dockerCompose: boolean;
    dockerfile: boolean;
  };
  secrets: {
    envCommitted: boolean;
    likelyLeakedKeys: string[];
  };
  packageManager?: string;
}

export interface DimensionScore {
  id: string;
  label: string;
  weight: number;
  score: number;
  max: number;
  notes: string[];
  evidence?: string[];
}

export interface Scorecard {
  dimensions: DimensionScore[];
  total: number;
  max: number;
  tier: "A" | "B" | "C" | "D";
  frontendSubscore: number;
  backendSubscore: number;
  devopsSubscore: number;
  codeQualitySubscore: number;
  killerStrength?: string;
  killerWeakness?: string;
  auditedAt: string;
  auditor: "auto" | "llm" | "human";
}

export interface CostEstimate {
  currency: "USD";
  estimatedUsd?: number;
  inputTokens?: number;
  outputTokens?: number;
  source: "harness" | "manual" | "unknown";
}

export interface TaskDefinition {
  id: string;
  title: string;
  difficulty: "medium" | "large";
  summary: string;
  stack: string[];
  mustHave: string[];
  niceToHave: string[];
  forbidden: string[];
  scaffold: {
    command: string;
    createsInPlace: boolean;
  };
  prompts: {
    build: string;
    validate: string;
  };
  runtimeChecks: string[];
  scoringProfile: "fullstack-webdev";
}

export interface HarnessAdapter {
  id: HarnessId;
  label: string;
  isAvailable(): Promise<boolean>;
  run(opts: {
    cwd: string;
    prompt: string;
    models: ModelRole[];
    timeoutMs: number;
    logFile: string;
    env?: Record<string, string>;
  }): Promise<{
    exitCode: number | null;
    timedOut: boolean;
    tokens?: PhaseResult["tokens"];
    toolCalls?: number;
    rawSummary?: string;
  }>;
}
