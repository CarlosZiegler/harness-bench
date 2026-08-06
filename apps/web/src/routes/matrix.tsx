import { Link, createFileRoute } from "@tanstack/react-router"
import { fights } from "@/data/fights"
import { SiteHeader } from "@/components/compare/site-header"
import { Badge } from "@/components/compare/badge"

export const Route = createFileRoute("/matrix")({
  component: MatrixPage,
  head: () => ({
    meta: [{ title: "Matrix · Harness Bench" }],
  }),
})

function MatrixPage() {
  const completed = fights.filter((f) => f.status === "completed")

  return (
    <div className="min-h-svh">
      <SiteHeader active="/matrix" />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Cross-fight matrix
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          One table that grows as we finish campaigns — similar layout energy to
          multi-model harness eval blogs, but each column group is a fair fight
          (same model, different harness).
        </p>

        <div className="mt-8 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-3 font-medium">Fight</th>
                <th className="px-3 py-3 font-medium">Side A</th>
                <th className="px-3 py-3 font-medium">Score</th>
                <th className="px-3 py-3 font-medium">Side B</th>
                <th className="px-3 py-3 font-medium">Score</th>
                <th className="px-3 py-3 font-medium">Delta</th>
                <th className="px-3 py-3 font-medium">Winner</th>
              </tr>
            </thead>
            <tbody>
              {fights.map((f) => {
                const [a, b] = f.sides
                const done = f.status === "completed"
                const delta = done ? a.score.total - b.score.total : 0
                const winner = !done
                  ? "—"
                  : delta > 0
                    ? a.label
                    : delta < 0
                      ? b.label
                      : "Tie"
                return (
                  <tr key={f.id} className="border-b last:border-0">
                    <td className="px-3 py-3">
                      <Link
                        to="/fights/$fightId"
                        params={{ fightId: f.id }}
                        className="font-medium hover:underline"
                      >
                        #{f.number} {f.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {f.task}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{a.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.model}
                      </div>
                    </td>
                    <td className="px-3 py-3 tabular-nums font-semibold">
                      {done ? a.score.total : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{b.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.model}
                      </div>
                    </td>
                    <td className="px-3 py-3 tabular-nums font-semibold">
                      {done ? b.score.total : "—"}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">
                      {done ? (delta > 0 ? `+${delta}` : delta) : "—"}
                    </td>
                    <td className="px-3 py-3">
                      {done ? (
                        <Badge tone={delta === 0 ? "tie" : "win"}>{winner}</Badge>
                      ) : (
                        <Badge tone="planned">{f.status}</Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {completed.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">No completed fights yet.</p>
        )}

        <section className="mt-12 max-w-2xl space-y-2 text-sm text-muted-foreground">
          <h2 className="text-foreground font-semibold">How to read this</h2>
          <p>
            Each row is a controlled experiment. Do not compare Side A of Fight #1
            to Side A of Fight #2 as a pure model ranking — models differ by design
            across rows. Compare <em>within</em> a row to isolate harness effect.
          </p>
        </section>
      </main>
    </div>
  )
}
