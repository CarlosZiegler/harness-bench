# `@harness-bench/bench`

Node/Bun CLI to benchmark coding harnesses on fullstack TanStack Start apps.

## Quick start

From monorepo root:

```bash
bun install
bun run bench -- tasks
bun run bench -- harnesses
bun run bench -- presets

# Dry run (writes prompts + result skeleton, no agent)
bun run bench -- run -t pulseboard --preset prime-grok-4.5 --dry-run

# Claude Code solo
bun run bench -- run -t pulseboard --preset claude-opus-4.7

# Codex SOL planner + Luna executor
bun run bench -- run -t pulseboard --preset codex-sol-luna-xhigh

# Re-score an existing app tree
bun run bench -- score --slug pulseboard-claude-code-opus-4-7

# Compare
bun run bench -- compare slug-a slug-b
```

## Layout

```text
packages/bench/
  src/cli          CLI entry
  src/harness      adapters (prime-agent, claude-code, codex, manual)
  src/tasks        task definitions
  src/score        structural scan + auto rubric
  src/runtime      install/build/docker checks
  src/report       markdown leaderboard
  prompts/tasks    phase1/phase2 prompts
  rubrics          scoring docs
config/            JSON mirrors for humans
```

Outputs:

```text
apps/<slug>/           generated application
results/<slug>/        result.json, report.md, logs, prompts
docs/leaderboard.md    aggregate table
```

## Environment

| Var | Effect |
|---|---|
| `BENCH_SKIP_DOCKER=1` | Skip docker build/compose checks |
| Harness auth | `claude` / `codex` / provider keys as usual |

## Naming

`<task>-<harness>-<model-slug>`

Example: `pulseboard-prime-agent-grok-4-5`
