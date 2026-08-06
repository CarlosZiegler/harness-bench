# Harness Bench

**Fair fights between coding harnesses** on the same fullstack task.

Same **task** · same **model** · same **effort** · only the **harness** changes.

We score delivery (frontend / backend / devops / quality), capture **side-by-side screenshots**, keep **code excerpts**, and document hangs/failures instead of erasing them.

Inspired by harness-sensitive eval writeups (e.g. [Prime Intellect — Prime Agent](https://www.primeintellect.ai/blog/prime-agent)) and fullstack agent benches — adapted to **harness delta**, not model leaderboards mixed in one row.

---

## Results (so far)

| Fight | Matchup | Model | Score | Notes |
|---:|---|---|---|---|
| **#1** | Prime Agent vs Grok CLI | Grok 4.5 @ high | **98 vs 89** | Prime wins systems (docker/compose). Grok wins human FE (shell/composer). |
| **#2** | Prime Agent vs Codex | GPT-5.6 Luna @ xhigh | **98 vs 89** | Prime attempt 1 **hang** archived; attempt 2 scored. Codex faster, prettier landing; docker + e2e auth weaker. |

### Browse the compare site

```bash
bun install
bun run --filter web dev
# http://localhost:3000
# /                        overview + methodology + FF#1 screenshots
# /fights/fair-fight-1     full write-up
# /fights/fair-fight-2     Luna fight
# /matrix                  cross-fight table
```

### Written reports

- [docs/fair-fight-1/RESULTS.md](./docs/fair-fight-1/RESULTS.md) — screenshots + human UI review  
- [docs/fair-fight-2/RESULTS.md](./docs/fair-fight-2/RESULTS.md) — attempts + hang taxonomy  
- [docs/methodology.md](./docs/methodology.md)  
- [docs/hang-taxonomy.md](./docs/hang-taxonomy.md)  
- [docs/leaderboard.md](./docs/leaderboard.md)

---

## Monorepo layout

```text
harness-bench/
├── apps/
│   ├── web/                          # compare site (TanStack Start)
│   ├── pulseboard-*-grok-4-5-high/   # FF#1 generated apps
│   └── pulseboard-*-luna-xhigh/      # FF#2 generated apps
├── packages/
│   ├── bench/                        # CLI runner, adapters, prompts, rubrics
│   └── ui/                           # shared shadcn ui
├── docs/                             # methodology + fight write-ups + screenshots
└── results/                          # result.json, report.md, HANG.md, attempts/
```

App naming: `<task>-<harness>-<model>-<effort>`

---

## Stack under test (fixed)

**TanStack Start · Drizzle ORM · PostgreSQL · Better Auth · shadcn/ui · Tailwind · Dockerfile + docker-compose**

Scaffold used by the bench:

```bash
bunx --bun shadcn@latest init --preset b0 --template start --pointer --yes --force -n app
```

---

## Prerequisites

| Tool | Why |
|---|---|
| **Bun** ≥ 1.3 | monorepo + apps |
| **Node** ≥ 20 | tooling |
| **Docker** | compose runtime checks |
| Harness CLIs you want to compare | `prime-agent`, `grok`, `codex`, `claude`, … |
| Provider auth | e.g. `grok login`, `codex` login / API keys, Prime provider config |

This repo does **not** ship API keys. `.env` files are gitignored; only `.env.example` is tracked.

---

## Reproduce a fair fight

### 1. Install

```bash
git clone https://github.com/CarlosZiegler/harness-bench.git
cd harness-bench
bun install
```

### 2. See available presets / harnesses

```bash
bun run bench -- tasks
bun run bench -- harnesses
bun run bench -- presets
```

### 3. Run sides **sequentially** (recommended)

**Fight #1 — Grok 4.5 @ high**

```bash
bun run bench -- run -t pulseboard --preset fair-prime-grok-4.5-high --force --timeout-minutes 120
bun run bench -- run -t pulseboard --preset fair-grok-cli-grok-4-5-high --force --timeout-minutes 120
bun run bench -- compare \
  pulseboard-prime-agent-grok-4-5-high \
  pulseboard-grok-cli-grok-4-5-high
```

**Fight #2 — Luna @ xhigh**

```bash
bun run bench -- run -t pulseboard --preset fair-prime-luna-xhigh --force --timeout-minutes 120
bun run bench -- run -t pulseboard --preset fair-codex-luna-xhigh --force --timeout-minutes 120
bun run bench -- compare \
  pulseboard-prime-agent-luna-xhigh \
  pulseboard-codex-luna-xhigh
```

### 4. Score / report only

```bash
bun run bench -- score --slug pulseboard-prime-agent-grok-4-5-high
bun run bench -- report
```

### 5. Skip Docker checks (optional)

```bash
BENCH_SKIP_DOCKER=1 bun run bench -- run -t pulseboard --preset fair-prime-luna-xhigh --force
```

---

## Fair-fight rules (important)

1. **Pin model + effort** on both sides (presets do this).  
2. **Same task prompt** (`packages/bench/prompts/tasks/pulseboard.*.md`).  
3. **No mid-run human edits** inside `apps/<slug>` while the harness runs.  
4. **Sequential** runs on one machine (avoid CPU/API/docker contention).  
5. **Document hangs** — do not delete failure history (`results/**/HANG.md`, `attempts/`).  
6. If the parent shell is itself Prime Agent, adapters **strip** `PRIME_AGENT_INTERNAL_*` / `RLM_*` so children do not inherit the wrong session/model.

### Effort mapping

| Grok CLI | Prime Agent | Codex |
|---|---|---|
| `--effort high` | `--thinking high` | `model_reasoning_effort=high` |
| — | `--thinking xhigh` | `model_reasoning_effort=xhigh` |

### Known harness gotchas (we hit these)

| Issue | Mitigation in this repo |
|---|---|
| Prime child inherits parent daemon env → hang | env sanitize + `extendEnv: false` |
| Prime `--flag=value` rejected | space-separated autonomous flags |
| Prime idle after build / orphan `vite dev` | stream `build.log`, idle-mtime watchdog, process-group kill, completion contract, `PORT=3110` |
| Codex defaults to Sol@high in `~/.codex` | force `-m gpt-5.6-luna` + effort override |
| Nested `git init` in scaffolded apps | remove before publish; gitignore `**/.git/` |

---

## Scoring

Rubric: [`packages/bench/rubrics/fullstack-webdev.md`](./packages/bench/rubrics/fullstack-webdev.md)

| Dimension | Max |
|---|---:|
| Deliverables | 20 |
| Backend | 15 |
| Frontend / WebDev | 25 |
| Auth & flows | 10 |
| DevOps / runtime | 15 |
| Code quality | 10 |
| Architecture | 5 |

**Auto FE is heuristic.** For UI claims we also do **human screenshot review** (shell full-height, icon/title/description density, disabled CTAs, etc.) — see FF#1 RESULTS.

Tiers: **A** 80+ · **B** 60–79 · **C** 40–59 · **D** &lt;40

---

## Run a generated app locally

```bash
cd apps/pulseboard-prime-agent-grok-4-5-high   # or another slug
cp .env.example .env
# edit secrets — never commit .env
docker compose up --build
# or: bun install && bun run db:push && bun dev
```

Some Codex/Grok Dockerfiles may fail image build (documented per fight); apps often still run via `bun run build` + `bun run start` with a local Postgres.

---

## Security

- No production API keys are stored in this repository.  
- Local `.env` files used during bench e2e are **gitignored**.  
- `.env.example` files contain **placeholders** only (`replace-with-…`, local docker defaults).  
- Large agent transcripts/`build.log` streams are **not** published (can contain tool noise); scores + hang reports + screenshots are.

If you re-run fights, double-check `git status` before push and never force-add `.env`.

---

## Package: `@harness-bench/bench`

```bash
bun run bench -- --help
```

See [packages/bench/README.md](./packages/bench/README.md).

---

## License

MIT — generated app code is output of third-party models/harnesses; use accordingly.
