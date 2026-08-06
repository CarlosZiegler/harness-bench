# Fullstack WebDev Rubric (0–100)

Inspired by:

- [Akita LLM Coding Benchmark](https://github.com/akitaonrails/llm-coding-benchmark) — structural + runtime + API-correctness discipline
- [Arena Agent methodology](https://arena.ai/blog/agent-arena-methodology) — multi-signal outcomes (success, recovery, tool hallucination)
- [Arena WebDev leaderboard](https://arena.ai/leaderboard/code/webdev) — frontend/fullstack visual + UX quality as a first-class axis

Auto-scoring implements a **heuristic subset**. Final published comparisons should add an LLM/human audit pass using this doc.

---

## Dimensions

| ID | Dimension | Max | What good looks like |
|---|---|---:|---|
| deliverables | Deliverable completeness | 20 | README, Dockerfile, compose, stack libs, tests, env example |
| backend | Backend correctness | 15 | Drizzle schema, Postgres, Better Auth wired for real |
| frontend | Frontend / WebDev quality | 25 | Designed UI, routes, components, responsive, a11y, states |
| auth_flows | Auth & product flows | 10 | sign-up/in, session, protected routes, workspace/org |
| devops | DevOps / runtime | 15 | install, typecheck, build, docker build, compose up |
| code_quality | Code quality & hygiene | 10 | tests, no secret leaks, no giant god-files |
| architecture | Architecture | 5 | clear folders, server/ui separation |

**Tier**

| Tier | Score | Meaning |
|:---:|---:|---|
| A | 80–100 | Ship with trivial fixes |
| B | 60–79 | 1–2 hours to ship |
| C | 40–59 | Major rework |
| D | 0–39 | Throwaway |

---

## Frontend / WebDev (25) — Arena-inspired checklist

Score qualitatively (LLM/human) or via heuristics (auto):

1. **Visual hierarchy** — clear page title, section spacing, card rhythm (not default scaffold)
2. **Component composition** — shadcn/re-ui primitives composed; not one 800-line route file
3. **Responsive** — usable at mobile + desktop breakpoints
4. **Theme** — dark mode or intentional theme tokens
5. **States** — loading skeletons, empty states, error callouts
6. **Forms** — labels, validation messages, disabled/pending submit
7. **Navigation** — app shell, active states, sensible IA
8. **Accessibility** — focus, aria on icon buttons, contrast not obviously broken
9. **Motion** — optional; subtle only (no jank)
10. **Polish** — copy matches product; no lorem; favicon/meta basics

When doing pairwise human preference (Arena-style), show two anonymous screenshots/URLs and ask:
> Which result would you rather ship as an MVP UI?

---

## Backend (15)

- Real Drizzle schema matching product entities
- Better Auth integrated (not a fake `localStorage` auth)
- Server functions / route handlers enforce auth
- DB constraints (unique votes, FKs) where relevant
- No hallucinated ORM APIs

---

## DevOps / runtime (15)

Must attempt in order:

1. package install  
2. typecheck  
3. production build  
4. `docker build`  
5. `docker compose up --build` (app + postgres)

Partial credit for each green check. Missing compose is a hard deliverable miss.

---

## Agent-behavior signals (optional, logged when available)

Aligned with Arena causal signals (not always in auto score):

| Signal | How we approximate |
|---|---|
| Confirmed success | runtime allPassed + tier ≥ B |
| Bash recovery | count of failed→success command pairs in logs |
| Tool hallucination | harness errors about unknown tools |
| Steerability | N/A in unattended mode (single prompt) |
| Cost | tokens × price table when harness exposes usage |

---

## Anti-metrics (do not optimize)

- Raw file count  
- Raw LOC  
- Test count without quality  
- “Looks busy” git diffs  

---

## LLM audit prompt (paste into a judge model)

```
Audit the app at <APP_DIR> for benchmark slug <SLUG>.

Stack expected: TanStack Start, Drizzle, Postgres, Better Auth, shadcn/re-ui, Docker Compose.

Score each dimension in rubrics/fullstack-webdev.md with evidence (file:line).
Verify Better Auth + Drizzle usage against real package APIs (do not invent).
Produce: scores table, total/100, tier, killer strength, killer weakness.
Under 800 words.
```
