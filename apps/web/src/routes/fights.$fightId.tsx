import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { getFight } from "@/data/fights"
import { SiteHeader } from "@/components/compare/site-header"
import { Badge } from "@/components/compare/badge"
import { MatrixTable } from "@/components/compare/matrix-table"
import { SideCard } from "@/components/compare/side-card"
import { ScreenshotCompare } from "@/components/compare/screenshot-compare"
import { CodeCompare } from "@/components/compare/code-compare"

export const Route = createFileRoute("/fights/$fightId")({
  component: FightPage,
  loader: ({ params }) => {
    const fight = getFight(params.fightId)
    if (!fight) throw notFound()
    return { fight }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.fight.title} · Harness Bench`
          : "Fight · Harness Bench",
      },
    ],
  }),
})

function FightPage() {
  const { fight } = Route.useLoaderData()
  const [a, b] = fight.sides
  const aWins = a.score.total > b.score.total
  const bWins = b.score.total > a.score.total
  const aFaster =
    fight.id === "fair-fight-1" ? false : false /* set per fight later */
  const bFaster = fight.id === "fair-fight-1"

  return (
    <div className="min-h-svh">
      <SiteHeader active={`/fights/${fight.id}`} />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={fight.status}>Fight #{fight.number}</Badge>
          <Badge tone={fight.status}>{fight.status}</Badge>
          {fight.date && (
            <span className="text-xs text-muted-foreground">{fight.date}</span>
          )}
        </div>

        <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {fight.title}
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground text-pretty">
          {fight.question}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {fight.stack.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>

        {/* Controls */}
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Fixed controls
          </h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {fight.controls.map((c) => (
              <div key={c.label} className="rounded-xl border bg-card px-3 py-2.5">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </dt>
                <dd className="text-sm font-medium">{c.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {fight.status === "planned" ? (
          <section className="mt-12 rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
            <h2 className="text-xl font-semibold">Not run yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              This card is reserved so the site structure stays stable. After the
              run we fill scores, screenshots, code samples, and the matrix —
              same template as Fight #1.
            </p>
            <Link to="/" className="mt-4 inline-block text-sm font-medium underline">
              Back to overview
            </Link>
          </section>
        ) : (
          <>
            {/* Side cards */}
            <section className="mt-12 grid gap-4 lg:grid-cols-2">
              <SideCard
                side={a}
                highlight={aWins ? "winner" : aFaster ? "faster" : null}
              />
              <SideCard
                side={b}
                highlight={bWins ? "winner" : bFaster ? "faster" : null}
              />
            </section>

            {/* Bottom line */}
            <section className="mt-10 rounded-2xl border bg-foreground text-background p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Bottom line
              </h2>
              <p className="mt-2 text-base leading-relaxed sm:text-lg">
                {fight.bottomLine}
              </p>
            </section>

            {/* Matrix */}
            <section className="mt-14 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">
                Score matrix
              </h2>
              <p className="text-sm text-muted-foreground">
                Per-metric winners in bold — same spirit as multi-harness eval
                tables, scoped to this fair fight.
              </p>
              <MatrixTable fight={fight} />
            </section>

            {/* Insights */}
            <section className="mt-14">
              <h2 className="text-2xl font-semibold tracking-tight">Insights</h2>
              <ul className="mt-4 space-y-3">
                {fight.insights.map((ins) => (
                  <li
                    key={ins}
                    className="flex gap-3 rounded-xl border bg-card px-4 py-3 text-sm leading-relaxed"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground" />
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Human FE callout */}
            {fight.id === "fair-fight-1" && (
              <section className="mt-14 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
                <h2 className="text-lg font-semibold tracking-tight">
                  Human UI review (screenshots beat auto FE)
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Auto FE: Prime 100 vs Grok 92. Human QA flips it:{" "}
                  <strong className="text-foreground">Grok ~88 · Prime ~70</strong>.
                  Prime’s sidebar does not reach the bottom of the viewport (user/sign-out
                  sit mid-page). Grok’s shell is full-height; mood chips use emoji+title on
                  one line with description under; Post stays disabled until the note is
                  valid; character count is live. Prime keeps better page titles
                  (eyebrow + H1 + description) and a deeper Settings members list.
                </p>
                <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <li className="rounded-lg border bg-background/60 px-3 py-2">
                    <span className="font-medium">Pulses header:</span> Prime =
                    eyebrow + “Team feed” + blurb · Grok = “Pulses” + blurb
                  </li>
                  <li className="rounded-lg border bg-background/60 px-3 py-2">
                    <span className="font-medium">Mood cell:</span> Prime title+hint ·
                    Grok emoji+title row + hint + radio a11y
                  </li>
                  <li className="rounded-lg border bg-background/60 px-3 py-2">
                    <span className="font-medium">Broken ⇒ point loss:</span> Prime shell
                    height
                  </li>
                  <li className="rounded-lg border bg-background/60 px-3 py-2">
                    <span className="font-medium">Better UX ⇒ point gain:</span> Grok
                    disabled CTA, counters, shell
                  </li>
                </ul>
              </section>
            )}

            {/* Screenshots */}
            <section className="mt-14 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Frontend screenshots — side by side
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Each screen captured live (agent-browser). Left = {a.label}, right = {b.label}.
                  Click a shot to open full size.
                </p>
              </div>
              <ScreenshotCompare a={a} b={b} />
            </section>

            {/* Code */}
            <section className="mt-14 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Codebase excerpts
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Representative slices — not full repos. Full trees live under{" "}
                  <code className="text-xs">apps/&lt;slug&gt;</code>.
                </p>
              </div>
              <CodeCompare a={a} b={b} />
            </section>

            {/* Notes / why */}
            <section className="mt-14 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-card p-5">
                <h3 className="font-semibold">Why {a.label} scored higher</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {a.strengths.slice(0, 4).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border bg-card p-5">
                <h3 className="font-semibold">Why {b.label} still matters</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {b.strengths.slice(0, 4).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}

        <p className="mt-16 text-center text-sm text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            ← All fights
          </Link>
          {" · "}
          <Link to="/matrix" className="underline-offset-4 hover:underline">
            Aggregate matrix
          </Link>
        </p>
      </main>
    </div>
  )
}
