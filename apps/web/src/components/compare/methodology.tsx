import { pulseboardPrompt, pulseboardPromptSource } from "@/data/prompt-pulseboard"
import { Badge } from "./badge"

export function MethodologySection() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Methodology</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Inspired by harness-sensitive eval writeups (e.g. Prime Intellect agent
          tables): we do <strong className="text-foreground">not</strong> mix models
          inside a row. Each fair fight pins model + effort + task, then varies only
          the coding harness.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card
          title="1. Controls"
          body="Same Pulseboard brief, same scaffold command, same timeout band, no mid-run human edits to apps/*."
        />
        <Card
          title="2. Run"
          body="Sequential unattended runs. Agent owns the plan (Mode 1). Scaffold may be shared orchestration; product code is 100% harness."
        />
        <Card
          title="3. Measure"
          body="Auto rubric (FE/BE/Ops/quality), runtime install/typecheck/build/docker/compose, then live e2e screenshots via agent-browser."
        />
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">Scoring rubric (0–100)</h3>
          <Badge>fullstack-webdev</Badge>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Dimension</th>
                <th className="py-2 pr-3 font-medium">Max</th>
                <th className="py-2 font-medium">What it captures</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                ["Deliverables", "20", "README, Docker, compose, stack libs, tests"],
                ["Backend", "15", "Drizzle + Postgres + Better Auth wiring"],
                ["Frontend / WebDev", "25", "UI polish, routes, states, a11y signals"],
                ["Auth & flows", "10", "sign-up/in, session, protected routes, workspace"],
                ["DevOps / runtime", "15", "install · typecheck · build · docker · compose"],
                ["Code quality", "10", "tests, secrets hygiene, file size"],
                ["Architecture", "5", "folder structure, server/ui split"],
              ].map(([d, m, w]) => (
                <tr key={d} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-medium">{d}</td>
                  <td className="py-2 pr-3 tabular-nums">{m}</td>
                  <td className="py-2 text-muted-foreground">{w}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Tiers: A 80+ · B 60–79 · C 40–59 · D &lt;40. File count / LOC are anti-metrics.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Task prompt (Pulseboard)</h3>
          <code className="text-[11px] text-muted-foreground">{pulseboardPromptSource}</code>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Both harnesses receive the same product brief (path/slug substituted per
          run). Below is the full phase-1 build prompt used in fair fights.
        </p>
        <pre className="mt-4 max-h-[420px] overflow-auto rounded-xl bg-[#0c0c0e] p-4 text-[11.5px] leading-relaxed text-zinc-100">
          <code>{pulseboardPrompt}</code>
        </pre>
      </div>

      <div className="rounded-2xl border bg-muted/20 p-5 text-sm leading-relaxed text-muted-foreground">
        <h3 className="font-semibold text-foreground">What we do not claim</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Cross-row model rankings when models differ between fights</li>
          <li>Results from broken adapters (invalid runs are discarded)</li>
          <li>That file count or “busy” diffs mean quality</li>
        </ul>
      </div>
    </section>
  )
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}
