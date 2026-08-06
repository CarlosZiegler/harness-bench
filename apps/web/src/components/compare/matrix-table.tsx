import type { Fight, Verdict } from "@/data/fights"
import { Badge } from "./badge"

function tone(v?: Verdict) {
  if (v === "win") return "win"
  if (v === "lose") return "lose"
  if (v === "tie") return "tie"
  return "na"
}

function Cell({
  value,
  verdict,
}: {
  value: string
  verdict?: Verdict
}) {
  const bold = verdict === "win"
  return (
    <td className="px-3 py-2.5 align-middle">
      <div className="flex items-center gap-2">
        <span className={bold ? "font-semibold tabular-nums" : "tabular-nums text-muted-foreground"}>
          {value}
        </span>
        {verdict && verdict !== "n/a" && (
          <Badge tone={tone(verdict)}>{verdict}</Badge>
        )}
      </div>
    </td>
  )
}

export function MatrixTable({ fight }: { fight: Fight }) {
  const [a, b] = fight.sides
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-3 py-3 font-medium w-[28%]">Eval</th>
            <th className="px-3 py-3 font-medium">{a.label}</th>
            <th className="px-3 py-3 font-medium">{b.label}</th>
          </tr>
          <tr className="border-b bg-muted/20 text-xs text-muted-foreground">
            <th className="px-3 py-2 font-normal">metric</th>
            <th className="px-3 py-2 font-normal">
              {a.harness} · {a.model}
            </th>
            <th className="px-3 py-2 font-normal">
              {b.harness} · {b.model}
            </th>
          </tr>
        </thead>
        <tbody>
          {fight.matrix.map((row) => (
            <tr key={row.metric} className="border-b last:border-0">
              <td className="px-3 py-2.5">
                <div className="font-medium">{row.metric}</div>
                {row.hint && (
                  <div className="text-xs text-muted-foreground italic">{row.hint}</div>
                )}
              </td>
              <Cell value={row.a.value} verdict={row.a.verdict} />
              <Cell value={row.b.value} verdict={row.b.verdict} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
