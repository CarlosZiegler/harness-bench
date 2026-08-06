/**
 * Harness Bench fight registry.
 * Add a new fight object after each campaign; the / and /fights/$id pages render from this.
 */

export type Verdict = "win" | "lose" | "tie" | "n/a"

export interface Scorecard {
  total: number
  tier: "A" | "B" | "C" | "D"
  frontend: number
  backend: number
  devops: number
  codeQuality: number
}

export interface RuntimeChecks {
  install: boolean
  typecheck: boolean
  build: boolean
  dockerBuild: boolean
  composeUp: boolean
}

export interface SideResult {
  id: string
  label: string
  harness: string
  model: string
  effort: string
  slug: string
  appDir: string
  score: Scorecard
  status: string
  wallTimeLabel: string
  runtime: RuntimeChecks
  costUsd?: number
  turns?: number
  screenshots: { id: string; title: string; src: string; note?: string }[]
  codeSamples: { id: string; title: string; language: string; code: string }[]
  strengths: string[]
  weaknesses: string[]
}

export interface Fight {
  id: string
  number: number
  title: string
  question: string
  status: "completed" | "running" | "planned"
  date?: string
  task: string
  stack: string[]
  controls: { label: string; value: string }[]
  sides: [SideResult, SideResult]
  /** matrix-style metric rows: metric -> [sideA, sideB] display */
  matrix: {
    metric: string
    hint?: string
    a: { value: string; verdict?: Verdict }
    b: { value: string; verdict?: Verdict }
  }[]
  insights: string[]
  bottomLine: string
  artifacts: { label: string; href: string }[]
}

// ---------------------------------------------------------------------------
// Snippets inlined (short) so the page has zero runtime file reads
// ---------------------------------------------------------------------------

const primeSchema = `export const workspace = pgTable("workspace", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const pulse = pgTable("pulse", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  mood: text("mood").notNull(), // great | ok | blocked
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})`

const grokSchema = `export const workspaces = pgTable("workspace", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const pulses = pgTable("pulse", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull(),
  mood: moodEnum("mood").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})`

const primeDocker = `FROM oven/bun:1.2-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.2-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:1.2-alpine AS runner
WORKDIR /app
# ... entrypoint assembles DATABASE_URL from parts
CMD ["bun", "run", "start"]`

const grokDocker = `FROM oven/bun:1.2-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
# ^ FAILED in bench: lockfile had changes, frozen

FROM oven/bun:1.2-alpine AS build
...
CMD ["bun", "run", "./scripts/serve.ts"]`

// ---------------------------------------------------------------------------

export const fights: Fight[] = [
  {
    id: "fair-fight-1",
    number: 1,
    title: "Harness delta — Prime Agent vs Grok CLI",
    question:
      "Same model, same effort, same task: how much does the coding harness change fullstack delivery?",
    status: "completed",
    date: "2026-08-06",
    task: "Pulseboard — team pulse dashboard",
    stack: [
      "TanStack Start",
      "Drizzle",
      "PostgreSQL",
      "Better Auth",
      "shadcn/ui",
      "Docker Compose",
    ],
    controls: [
      { label: "Model", value: "Grok 4.5" },
      { label: "Effort", value: "high" },
      { label: "Plan mode", value: "Agent owns plan (Mode 1)" },
      { label: "Task", value: "pulseboard" },
      { label: "Scaffold", value: "shadcn start preset b0 (shared)" },
    ],
    sides: [
      {
        id: "prime",
        label: "Prime Agent",
        harness: "prime-agent",
        model: "xai/grok-4.5",
        effort: "high (--thinking high)",
        slug: "pulseboard-prime-agent-grok-4-5-high",
        appDir: "apps/pulseboard-prime-agent-grok-4-5-high",
        score: {
          total: 98,
          tier: "A",
          frontend: 100,
          backend: 100,
          devops: 100,
          codeQuality: 94,
        },
        status: "completed",
        wallTimeLabel: "~28 min (build + validate + runtime)",
        runtime: {
          install: true,
          typecheck: true,
          build: true,
          dockerBuild: true,
          composeUp: true,
        },
        screenshots: [
          {
            id: "sign-in",
            title: "Sign in",
            src: "/fights/fair-fight-1/prime/02-sign-in.png",
          },
          {
            id: "sign-up",
            title: "Sign up",
            src: "/fights/fair-fight-1/prime/03-sign-up.png",
          },
          {
            id: "dashboard",
            title: "Dashboard (authed)",
            src: "/fights/fair-fight-1/prime/05-after-signup.png",
            note: "Eyebrow + workspace H1 + blurb · stats · empty “Quiet so far”. Shell height still broken.",
          },
          {
            id: "pulses",
            title: "Pulses",
            src: "/fights/fair-fight-1/prime/06-app-pulses.png",
            note: "Eyebrow Pulses → H1 Team feed → desc. Mood title+hint cards (no emoji). Sidebar ends mid-page.",
          },
          {
            id: "settings",
            title: "Settings",
            src: "/fights/fair-fight-1/prime/06-app-settings.png",
            note: "Eyebrow + H1 Workspace · members list (content win) · shell still short.",
          },
        ],
        codeSamples: [
          {
            id: "schema",
            title: "Drizzle schema (pulse)",
            language: "ts",
            code: primeSchema,
          },
          {
            id: "docker",
            title: "Dockerfile (multi-stage)",
            language: "dockerfile",
            code: primeDocker,
          },
        ],
        strengths: [
          "Full runtime green: install → typecheck → build → docker → compose",
          "Auth + route protection solid (unauth /app → 307 /sign-in)",
          "Page headers: eyebrow + H1 + description (strong hierarchy)",
          "Settings depth: members list with avatars + roles",
          "12 tests passing in agent validate notes",
        ],
        weaknesses: [
          "CRITICAL FE: sidebar/nav not full viewport height — user/sign-out float mid-page",
          "Mood picker text-only cards (no emoji); Post CTA not disabled-until-valid",
          "Slower wall clock than Grok CLI",
          "Auto FE over-credited layout that screenshot QA rejects",
        ],
      },
      {
        id: "grok-cli",
        label: "Grok CLI",
        harness: "grok-cli",
        model: "grok-4.5",
        effort: "high (--effort high)",
        slug: "pulseboard-grok-cli-grok-4-5-high",
        appDir: "apps/pulseboard-grok-cli-grok-4-5-high",
        score: {
          total: 89,
          tier: "A",
          frontend: 92,
          backend: 92,
          devops: 87,
          codeQuality: 86,
        },
        status: "completed_with_errors",
        wallTimeLabel: "14m 35s agent build",
        runtime: {
          install: true,
          typecheck: true,
          build: true,
          dockerBuild: false,
          composeUp: false,
        },
        costUsd: 2.61,
        turns: 68,
        screenshots: [
          {
            id: "sign-in",
            title: "Sign in",
            src: "/fights/fair-fight-1/grok/02-sign-in.png",
          },
          {
            id: "sign-up",
            title: "Sign up",
            src: "/fights/fair-fight-1/grok/03-sign-up.png",
          },
          {
            id: "dashboard",
            title: "Dashboard (authed)",
            src: "/fights/fair-fight-1/grok/05-after-signup.png",
            note: "Full-height shell · emoji mood radios · Post disabled · personalized subtitle.",
          },
          {
            id: "pulses",
            title: "Pulses",
            src: "/fights/fair-fight-1/grok/06-app-pulses.png",
            note: "H1+desc · mood emoji+title same line + desc · live 0/500 · shell to bottom.",
          },
          {
            id: "settings",
            title: "Settings",
            src: "/fights/fair-fight-1/grok/06-app-settings.png",
            note: "H1 Settings · Save disabled if unchanged · no members list (shallower).",
          },
        ],
        codeSamples: [
          {
            id: "schema",
            title: "Drizzle schema (pulse)",
            language: "ts",
            code: grokSchema,
          },
          {
            id: "docker",
            title: "Dockerfile (broken frozen lockfile)",
            language: "dockerfile",
            code: grokDocker,
          },
        ],
        strengths: [
          "Frontend winner: full-height app shell, footer nav pinned correctly",
          "Mood = emoji + title on one line + description under (radio a11y)",
          "Form UX: live 0/500 counter, Post disabled until note, Send icon",
          "Fastest ship (~half Prime wall time); clean 68-turn loop",
        ],
        weaknesses: [
          "Docker build fails: bun install --frozen-lockfile vs lockfile drift",
          "compose up blocked by image build",
          "Settings shallower (no members list)",
          "Page titles flatter (H1+blurb vs Prime eyebrow stack)",
        ],
      },
    ],
    matrix: [
      {
        metric: "Total score",
        hint: "0–100 fullstack rubric",
        a: { value: "98", verdict: "win" },
        b: { value: "89", verdict: "lose" },
      },
      {
        metric: "Tier",
        a: { value: "A", verdict: "tie" },
        b: { value: "A", verdict: "tie" },
      },
      {
        metric: "Frontend (auto)",
        hint: "heuristic — overfits structure",
        a: { value: "100", verdict: "win" },
        b: { value: "92", verdict: "lose" },
      },
      {
        metric: "Frontend (human / screenshots)",
        hint: "shell, components, form UX",
        a: { value: "70", verdict: "lose" },
        b: { value: "88", verdict: "win" },
      },
      {
        metric: "App shell full-height",
        a: { value: "broken (mid-page)", verdict: "lose" },
        b: { value: "correct", verdict: "win" },
      },
      {
        metric: "Mood control polish",
        a: { value: "title+hint cards", verdict: "lose" },
        b: { value: "emoji+title+desc radios", verdict: "win" },
      },
      {
        metric: "Composer form UX",
        a: { value: "required + toast", verdict: "lose" },
        b: { value: "disabled CTA + 0/500", verdict: "win" },
      },
      {
        metric: "Page title hierarchy",
        a: { value: "eyebrow+H1+desc", verdict: "win" },
        b: { value: "H1+desc", verdict: "lose" },
      },
      {
        metric: "Settings depth",
        a: { value: "members list", verdict: "win" },
        b: { value: "account only", verdict: "lose" },
      },
      {
        metric: "Backend",
        a: { value: "100", verdict: "win" },
        b: { value: "92", verdict: "lose" },
      },
      {
        metric: "DevOps / docker+compose",
        hint: "bench runtime checks",
        a: { value: "100 · all green", verdict: "win" },
        b: { value: "87 · docker fail", verdict: "lose" },
      },
      {
        metric: "Wall time",
        a: { value: "~28 min", verdict: "lose" },
        b: { value: "14m 35s", verdict: "win" },
      },
      {
        metric: "Live e2e auth→dashboard",
        a: { value: "pass", verdict: "tie" },
        b: { value: "pass", verdict: "tie" },
      },
      {
        metric: "Docker image build",
        a: { value: "pass", verdict: "win" },
        b: { value: "fail (frozen lockfile)", verdict: "lose" },
      },
    ],
    insights: [
      "Same Grok 4.5 @ high ships Tier-A in both harnesses — capability is shared; finish quality differs.",
      "Human FE (screenshots): Grok ~88 vs Prime ~70. Prime sidebar stops mid-viewport — layout defect, not taste.",
      "Components: Grok mood = emoji+title one line + description; live 0/500; Post disabled until valid. Prime = text cards + always-enabled CTA.",
      "Prime still wins page-title stacks (eyebrow+H1+desc) and Settings depth (members list).",
      "DevOps drives auto total (98 vs 89): Prime docker/compose green; Grok frozen-lockfile image fail.",
      "Never trust auto FE alone — it gave Prime 100 while screenshots show a broken shell.",
    ],
    bottomLine:
      "Grok CLI wins frontend (shell integrity + composer UX). Prime Agent wins systems (docker/compose + deeper settings). Auto total favors Prime (98 vs 89) because Ops is heavy — but if you choose on UI quality, Grok is ahead despite the lower headline score.",
    artifacts: [
      { label: "docs/fair-fight-1/RESULTS.md", href: "#" },
    ],
  },

  {
    id: "fair-fight-2",
    number: 2,
    title: "Prime Agent vs Codex — Luna xHigh",
    question:
      "Same GPT-5.6 Luna @ xhigh + same Pulseboard task: how much does Prime Agent vs Codex CLI change delivery?",
    status: "completed",
    date: "2026-08-06",
    task: "Pulseboard — team pulse dashboard",
    stack: [
      "TanStack Start",
      "Drizzle",
      "PostgreSQL",
      "Better Auth",
      "shadcn/ui",
      "Docker Compose",
    ],
    controls: [
      { label: "Model", value: "gpt-5.6-luna" },
      { label: "Effort", value: "xhigh" },
      { label: "Plan mode", value: "Agent owns plan (Mode 1)" },
      { label: "Task", value: "pulseboard" },
      { label: "Attempts (Prime)", value: "2 (1 hang archived, 2 scored)" },
    ],
    sides: [
      {
        id: "prime-luna",
        label: "Prime Agent",
        harness: "prime-agent",
        model: "gpt-5.6-luna",
        effort: "xhigh (--thinking xhigh)",
        slug: "pulseboard-prime-agent-luna-xhigh",
        appDir: "apps/pulseboard-prime-agent-luna-xhigh",
        score: {
          total: 98,
          tier: "A",
          frontend: 100,
          backend: 100,
          devops: 100,
          codeQuality: 94,
        },
        status: "completed (maxTurns exit 1; runtime green)",
        wallTimeLabel: "~1h 04m (attempt 2)",
        runtime: {
          install: true,
          typecheck: true,
          build: true,
          dockerBuild: true,
          composeUp: true,
        },
        screenshots: [
          { id: "sign-in", title: "Sign in", src: "/fights/fair-fight-2/prime/02-sign-in.png", note: "Classic Welcome back form" },
          { id: "sign-up", title: "Sign up", src: "/fights/fair-fight-2/prime/03-sign-up.png" },
          { id: "dashboard", title: "Dashboard (authed)", src: "/fights/fair-fight-2/prime/05-after-signup.png", note: "E2E signup worked · nav + empty pulses + composer" },
          { id: "pulses", title: "Pulses", src: "/fights/fair-fight-2/prime/06-app-pulses.png", note: "Team feed · mood cards · Post pulse" },
          { id: "settings", title: "Settings", src: "/fights/fair-fight-2/prime/06-app-settings.png" },
        ],
        codeSamples: [],
        strengths: [
          "Runtime all green including docker build + compose",
          "Live e2e: signup → authenticated app shell",
          "Attempt 2 finished after hang mitigations (stream log, watchdog, session-dir)",
          "Controls correct: luna@xhigh (not Grok)",
        ],
        weaknesses: [
          "Attempt 1 agent_hang after build (archived) — left vite dev, never exited",
          "Attempt 2 hit maxTurns 223/200 → process exit 1 despite shipped app",
          "Much slower wall clock than Codex (~64m vs ~38m)",
        ],
      },
      {
        id: "codex-luna",
        label: "Codex CLI",
        harness: "codex",
        model: "gpt-5.6-luna",
        effort: "xhigh (model_reasoning_effort)",
        slug: "pulseboard-codex-luna-xhigh",
        appDir: "apps/pulseboard-codex-luna-xhigh",
        score: {
          total: 89,
          tier: "A",
          frontend: 92,
          backend: 100,
          devops: 87,
          codeQuality: 80,
        },
        status: "completed_with_errors",
        wallTimeLabel: "~38m 19s",
        runtime: {
          install: true,
          typecheck: true,
          build: true,
          dockerBuild: false,
          composeUp: false,
        },
        screenshots: [
          { id: "sign-in", title: "Sign in", src: "/fights/fair-fight-2/codex/02-sign-in.png", note: "Marketing copy chrome — stronger visual design" },
          { id: "sign-up", title: "Sign up", src: "/fights/fair-fight-2/codex/03-sign-up.png", note: "Your name / Work email / Create workspace" },
          { id: "dashboard", title: "After signup (e2e)", src: "/fights/fair-fight-2/codex/05-after-signup.png", note: "E2E stayed on sign-up — auth path not closed in capture" },
          { id: "pulses", title: "App routes (e2e)", src: "/fights/fair-fight-2/codex/06-app-pulses.png", note: "Redirected to sign-in — session not established in automated run" },
          { id: "settings", title: "Settings (e2e)", src: "/fights/fair-fight-2/codex/06-app-settings.png", note: "Same sign-in wall" },
        ],
        codeSamples: [],
        strengths: [
          "Faster completion (~38m) with clean agent exit 0 on build+validate phases",
          "Landing/auth visual design richer (marketing hero, proof sections)",
          "Backend stack signals complete (Better Auth + Drizzle)",
        ],
        weaknesses: [
          "Docker build fails: COPY . . clashes with node_modules/better-auth",
          "Compose requires POSTGRES_PASSWORD — not defaulted",
          "Automated e2e auth did not enter /app (signup/session gap in this capture)",
        ],
      },
    ],
    matrix: [
      {
        metric: "Total score",
        hint: "0–100 fullstack rubric",
        a: { value: "98", verdict: "win" },
        b: { value: "89", verdict: "lose" },
      },
      {
        metric: "Tier",
        a: { value: "A", verdict: "tie" },
        b: { value: "A", verdict: "tie" },
      },
      {
        metric: "DevOps docker+compose",
        a: { value: "100 · all green", verdict: "win" },
        b: { value: "87 · docker/compose fail", verdict: "lose" },
      },
      {
        metric: "Wall time",
        a: { value: "~64m", verdict: "lose" },
        b: { value: "~38m", verdict: "win" },
      },
      {
        metric: "Live e2e auth→app",
        a: { value: "pass", verdict: "win" },
        b: { value: "fail (stuck auth)", verdict: "lose" },
      },
      {
        metric: "Landing/auth visual design",
        a: { value: "simple", verdict: "lose" },
        b: { value: "marketing polish", verdict: "win" },
      },
      {
        metric: "Agent clean exit",
        a: { value: "exit 1 maxTurns", verdict: "lose" },
        b: { value: "exit 0", verdict: "win" },
      },
      {
        metric: "Hang attempt archived",
        a: { value: "yes (attempt 1)", verdict: "n/a" },
        b: { value: "n/a", verdict: "n/a" },
      },
    ],
    insights: [
      "Attempt 1 Prime hang is documented history — not deleted; attempt 2 used stream-log + idle watchdog + session-dir + orphan kill.",
      "Same Luna@xhigh: Prime 98 vs Codex 89. Systems gap again is Docker/compose truth.",
      "Codex ships a prettier marketing landing/auth, but e2e auth entry failed in our browser script — design ≠ working session.",
      "Prime maxTurns exit 1 after shipping is a harness completion smell; product still runtime-green.",
      "Never inherit Grok from parent session — controls verified luna on both sides.",
    ],
    bottomLine:
      "Prime/Luna wins the fair fight on completion + devops + working auth e2e (98). Codex/Luna is faster and more designed on marketing surfaces (89) but loses docker packaging and failed automated app entry. Attempt-1 hang remains part of the Prime story.",
    artifacts: [
      { label: "docs/fair-fight-2/RESULTS.md", href: "#" },
      { label: "attempts/attempt-1-hang", href: "#" },
    ],
  }
]

export function getFight(id: string) {
  return fights.find((f) => f.id === id)
}

export function completedFights() {
  return fights.filter((f) => f.status === "completed")
}
