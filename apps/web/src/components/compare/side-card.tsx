import type { SideResult } from "@/data/fights"
import { Badge } from "./badge"
import { ScorePill } from "./score-pill"

export function SideCard({
  side,
  highlight,
}: {
  side: SideResult
  highlight?: "winner" | "faster" | null
}) {
  const rt = side.runtime
  const checks: [string, boolean][] = [
    ["install", rt.install],
    ["typecheck", rt.typecheck],
    ["build", rt.build],
    ["docker", rt.dockerBuild],
    ["compose", rt.composeUp],
  ]
  return (
    <article className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">{side.label}</h3>
            {highlight === "winner" && <Badge tone="win">higher score</Badge>}
            {highlight === "faster" && <Badge tone="tie">faster</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {side.harness} · {side.model}
          </p>
          <p className="text-xs text-muted-foreground">{side.effort}</p>
        </div>
        <ScorePill total={side.score.total} tier={side.score.tier} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <Stat label="FE" value={side.score.frontend} />
        <Stat label="BE" value={side.score.backend} />
        <Stat label="Ops" value={side.score.devops} />
        <Stat label="Qual" value={side.score.codeQuality} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {checks.map(([k, ok]) => (
          <Badge key={k} tone={ok ? "win" : "lose"}>
            {ok ? "✓" : "✗"} {k}
          </Badge>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Time:</span> {side.wallTimeLabel}
        {side.costUsd != null && (
          <>
            {" "}
            · <span className="font-medium text-foreground">Cost:</span> ~$
            {side.costUsd.toFixed(2)}
          </>
        )}
        {side.turns != null && (
          <>
            {" "}
            · <span className="font-medium text-foreground">Turns:</span> {side.turns}
          </>
        )}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <List title="Strengths" items={side.strengths} tone="win" />
        <List title="Weaknesses" items={side.weaknesses} tone="lose" />
      </div>

      <p className="font-mono text-[11px] text-muted-foreground break-all">{side.appDir}</p>
    </article>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function List({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: string
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
        <Badge tone={tone}>{items.length}</Badge>
      </div>
      <ul className="space-y-1.5 text-sm">
        {items.length === 0 && (
          <li className="text-muted-foreground">—</li>
        )}
        {items.map((item) => (
          <li key={item} className="leading-snug">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
