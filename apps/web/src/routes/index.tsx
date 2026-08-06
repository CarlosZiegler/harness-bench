import { Link, createFileRoute } from "@tanstack/react-router"
import { fights } from "@/data/fights"
import { SiteHeader } from "@/components/compare/site-header"
import { Badge } from "@/components/compare/badge"
import { MatrixTable } from "@/components/compare/matrix-table"
import { MethodologySection } from "@/components/compare/methodology"
import { ScreenshotCompare } from "@/components/compare/screenshot-compare"

export const Route = createFileRoute("/")({ component: HomePage })

function HomePage() {
  const completed = fights.filter((f) => f.status === "completed")
  const planned = fights.filter((f) => f.status !== "completed")
  const ff1 = fights.find((f) => f.id === "fair-fight-1")

  return (
    <div className="min-h-svh">
      <SiteHeader active="/" />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10">
        <section className="max-w-3xl">
          <Badge tone="completed">Harness Bench</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Which coding harness actually ships better apps?
          </h1>
          <p className="mt-4 text-lg text-muted-foreground text-pretty leading-relaxed">
            Same task. Same model. Same effort. Only the{" "}
            <strong className="font-medium text-foreground">harness</strong> changes.
            Scores, runtime checks, <strong className="font-medium text-foreground">side-by-side screenshots</strong>,
            code excerpts, and a clear verdict — who is better, who is worse, and why.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/fights/$fightId"
              params={{ fightId: "fair-fight-1" }}
              className="inline-flex h-10 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background"
            >
              Fight #1 results
            </Link>
            <Link
              to="/fights/$fightId"
              params={{ fightId: "fair-fight-2" }}
              className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium"
            >
              Fight #2 (Luna · running/planned)
            </Link>
            <a
              href="#methodology"
              className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium"
            >
              Methodology & prompt
            </a>
          </div>
        </section>

        {/* Campaign cards */}
        <section className="mt-14">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Campaigns
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {fights.map((f) => {
              const [a, b] = f.sides
              return (
                <Link
                  key={f.id}
                  to="/fights/$fightId"
                  params={{ fightId: f.id }}
                  className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:border-foreground/20 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={f.status}>
                      #{f.number} · {f.status}
                    </Badge>
                    {f.date && (
                      <span className="text-xs text-muted-foreground">{f.date}</span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:underline">
                    {f.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {f.question}
                  </p>
                  {f.status === "completed" ? (
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-semibold tabular-nums">
                        {a.label} {a.score.total}
                      </span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="font-semibold tabular-nums">
                        {b.label} {b.score.total}
                      </span>
                      <Badge tone="A">Tier {a.score.tier}/{b.score.tier}</Badge>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {a.model} @ {a.effort.split(" ")[0]} · {a.label} vs {b.label}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        </section>

        {ff1 && ff1.status === "completed" && (
          <>
            <section className="mt-16 space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Fight #1 — score matrix
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bold / win badge = better on that row. Same energy as multi-harness
                    eval tables — one model family per fight.
                  </p>
                </div>
                <Link
                  to="/fights/$fightId"
                  params={{ fightId: "fair-fight-1" }}
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  Full write-up →
                </Link>
              </div>
              <MatrixTable fight={ff1} />
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {ff1.bottomLine}{" "}
                <span className="text-foreground font-medium">
                  Human FE ≈ Grok 88 vs Prime 70
                </span>{" "}
                (shell + components), even when auto total favors Prime.
              </p>
            </section>

            <section className="mt-16 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Fight #1 — screenshots side by side
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Frontend comparison: each screen Prime vs Grok CLI after live e2e.
                </p>
              </div>
              <ScreenshotCompare a={ff1.sides[0]} b={ff1.sides[1]} />
            </section>
          </>
        )}

        <div id="methodology" className="mt-20 scroll-mt-20">
          <MethodologySection />
        </div>

        <section className="mt-16 rounded-2xl border bg-muted/20 p-6">
          <h2 className="text-lg font-semibold">Roadmap</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Done:</span> Fair Fight #1 —
              Prime vs Grok CLI · Grok 4.5 high
            </li>
            <li>
              <span className="font-medium text-foreground">Done:</span> Fair Fight #2 —
              Prime vs Codex · Luna xHigh (98 vs 89)
            </li>
            <li>Per-fight screenshot gallery + aggregate matrix across all fights</li>
          </ol>
          {planned.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              Open: {planned.map((p) => p.title).join(" · ")}
            </p>
          )}
          {completed.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Completed: {completed.map((p) => p.title).join(" · ")}
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
