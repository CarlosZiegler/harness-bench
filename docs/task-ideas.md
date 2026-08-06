# Task ideas — harness bench

## Selection criteria

A good task is:

1. **Fullstack** — auth + DB + UI + docker  
2. **Frontend-visible** — Arena WebDev axes matter  
3. **Not toy** — more than CRUD-on-one-table with no shell  
4. **Not epic** — strong agent finishes in 30–90 minutes  
5. **Stack-fixed** — TanStack Start · Drizzle · Postgres · Better Auth · shadcn/re-ui  

## Recommended default: **Pulseboard** ✅

**Team pulse / status dashboard**

| Layer | Scope |
|---|---|
| Auth | Better Auth email/password |
| Data | workspaces, members, pulses (mood + note) |
| UI | marketing, shell, dashboard cards, feed, composer |
| DevOps | Dockerfile + compose (app + postgres) |

**Why this one**

- Natural dashboard UI → exercises frontend hard  
- Multi-tenant light (workspace) without full RBAC nightmare  
- Clear acceptance path for runtime checks  
- Hard enough that harness differences show up (auth wiring, drizzle schema, compose)  

## Alternate: **Launchpad**

Feature-request board with votes and status columns. Same difficulty band; use as second run to avoid overfitting.

## Backlog ideas (future tasks)

| ID | Concept | Twist |
|---|---|---|
| `invoicelet` | Mini invoices | PDF-ish preview UI, line items |
| `changelog` | Public changelog + admin | MDX-ish rendering, RSS |
| `reservely` | Room/desk booking | calendar UI difficulty↑ |
| `snippetbox` | Private snippet vault | syntax highlight, sharing links |
| `supportkit` | Tiny helpdesk | ticket thread UI |
| `metricly` | Event counter + charts | chart library + aggregation |

Avoid for v1: multi-region, realtime CRDT, native mobile, heavy ML.

## Suggested comparison matrix (first campaign)

| Run | Harness | Models |
|---|---|---|
| 1 | prime-agent | grok-4.5 solo |
| 2 | claude-code | opus-4.7 solo |
| 3 | claude-code | sonnet-4.6 solo |
| 4 | codex | sol-xhigh planner + luna-xhigh executor |
| 5 | codex | luna-xhigh solo |
| 6 | prime-agent | opus-4.7 solo (same model, different harness) |

Run **6 vs 2** isolates harness effect (Akita’s key finding).

## Naming

Apps land in `apps/`:

```text
pulseboard-prime-agent-grok-4-5
pulseboard-claude-code-opus-4-7
pulseboard-codex-planner-sol-xhigh-executor-luna-xhigh
```

Pattern: `<task>-<harness>-<model(s)>[-rN]`
