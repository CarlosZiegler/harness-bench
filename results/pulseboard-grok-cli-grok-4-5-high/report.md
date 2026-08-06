# Run: `pulseboard-grok-cli-grok-4-5-high`

| Field | Value |
|---|---|
| Task | pulseboard |
| Harness | grok-cli |
| Models | `solo:grok-4.5` |
| Status | **completed_with_errors** |
| Elapsed | 14m35s |
| App dir | `/Users/zietec/work/harness-bench/apps/pulseboard-grok-cli-grok-4-5-high` |
| Started | 2026-08-06T12:41:54.516Z |
| Finished | 2026-08-06T12:56:29.196Z |

## Score: 89/100 (Tier A)

| Frontend | Backend | DevOps | Code quality |
|---:|---:|---:|---:|
| 92 | 92 | 87 | 86 |

| Dimension | Score | Notes |
|---|---:|---|
| Deliverable completeness | 20/20 | — |
| Backend correctness | 15/15 | — |
| Frontend / WebDev quality | 23/25 | reui not detected (optional but preferred) |
| Auth & product flows | 8/10 | no route protection signal |
| DevOps / runtime validation | 13/15 | runtime fail: docker_build — a256:c68f9ac482e8951e471872cd9843b61610e5524ec782889d3838424fab7df728 0.0s done
#4 DONE 3.1s

#5 [internal] load build context
#5 transferring context: 289.05MB 3.8s done
#5 ...

#6 [deps 2/4] WORKDIR /app
#6 DONE 0.9s

#5 [internal] load build context
#5 DONE 4.0s

#7 [deps 3/4] COPY package.json bun.lock ./
#7 DONE 0.0s

#8 [runner 3/9] RUN addgroup -S app && adduser -S app -G app
#8 DONE 0.1s

#9 [deps 4/4] RUN bun install --frozen-lockfile
#9 0.121 bun install v1.2.23 (cf136713)
#9 0.126 Resolving dependencies
#9 1.573 Resolved, downloaded and extracted [200]
#9 1.575 error: lockfile had changes, but lockfile is frozen
#9 1.575 note: try re-running without --frozen-lockfile and commit the updated lockfile
#9 ERROR: process "/bin/sh -c bun install --frozen-lockfile" did not complete successfully: exit code: 1
------
 > [deps 4/4] RUN bun install --frozen-lockfile:
0.121 bun install v1.2.23 (cf136713)
0.126 Resolving dependencies
1.573 Resolved, downloaded and extracted [200]
1.575 error: lockfile had changes, but lockfile is frozen
1.575 note: try re-running without --frozen-lockfile and commit the updated lockfile
------
Dockerfile:5
--------------------
   3 |     WORKDIR /app
   4 |     COPY package.json bun.lock ./
   5 | >>> RUN bun install --frozen-lockfile
   6 |     
   7 |     FROM oven/bun:1.2-alpine AS build
--------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c bun install --frozen-lockfile" did not complete successfully: exit code: 1; runtime fail: compose_up — 7cdd4fddcbdb87a2f096a
#5 resolve docker.io/oven/bun:1.2-alpine@sha256:0841c588f6304300baf1d395ae339ce09a6e18c4b6a7cdd4fddcbdb87a2f096a done
#5 DONE 0.0s

#6 [runner 3/9] RUN addgroup -S app && adduser -S app -G app
#6 CACHED

#7 [deps 2/4] WORKDIR /app
#7 CACHED

#8 [internal] load build context
#8 transferring context: 2.48MB 0.7s done
#8 DONE 0.7s

#9 [deps 3/4] COPY package.json bun.lock ./
#9 CACHED

#10 [deps 4/4] RUN bun install --frozen-lockfile
#10 0.105 bun install v1.2.23 (cf136713)
#10 0.109 Resolving dependencies
#10 1.475 Resolved, downloaded and extracted [200]
#10 1.476 error: lockfile had changes, but lockfile is frozen
#10 1.476 note: try re-running without --frozen-lockfile and commit the updated lockfile
#10 ERROR: process "/bin/sh -c bun install --frozen-lockfile" did not complete successfully: exit code: 1
------
 > [deps 4/4] RUN bun install --frozen-lockfile:
0.105 bun install v1.2.23 (cf136713)
0.109 Resolving dependencies
1.475 Resolved, downloaded and extracted [200]
1.476 error: lockfile had changes, but lockfile is frozen
1.476 note: try re-running without --frozen-lockfile and commit the updated lockfile
------
Dockerfile:5

--------------------

   3 |     WORKDIR /app

   4 |     COPY package.json bun.lock ./

   5 | >>> RUN bun install --frozen-lockfile

   6 |     

   7 |     FROM oven/bun:1.2-alpine AS build

--------------------

failed to solve: process "/bin/sh -c bun install --frozen-lockfile" did not complete successfully: exit code: 1
 |
| Code quality & hygiene | 5/10 | possible secret leak (1) |
| Architecture | 5/5 | — |

- **Strength:** Deliverable completeness (20/20)
- **Weakness:** Code quality & hygiene (5/10) — possible secret leak (1)

## Structural

- Files: 72 · tsx: 32 · components: 23 · routes: 9 · tests: 3
- Stack: tanstackStart, drizzle, betterAuth, shadcn, postgres, dockerCompose, dockerfile
- ⚠️ Possible secrets: postgr…res@

## Runtime checks

| Check | OK | Detail | Time |
|---|:---:|---|---:|
| Install dependencies | ✅ | bun install ok | 0s |
| Typecheck | ✅ | typecheck ok | 2s |
| Production build | ✅ | build ok | 2s |
| docker build | ❌ | a256:c68f9ac482e8951e471872cd9843b61610e5524ec782889d3838424fab7df728 0.0s done #4 DONE 3.1s  #5 [internal] load build context #5 transferring context: 289.05MB 3.8s done #5 ...  #6 [deps 2/4] WORKDIR | 8s |
| docker compose up --build -d | ❌ | 7cdd4fddcbdb87a2f096a #5 resolve docker.io/oven/bun:1.2-alpine@sha256:0841c588f6304300baf1d395ae339ce09a6e18c4b6a7cdd4fddcbdb87a2f096a done #5 DONE 0.0s  #6 [runner 3/9] RUN addgroup -S app && adduser | 4s |

## Phases

- **build**: completed (14m14s)

## Notes
- scaffold: ran `bunx --bun shadcn@latest init --preset b0 --template start --pointer --yes --force -n app`
- validate prompt written (prime-agent/manual — outer loop or --phase validate)
