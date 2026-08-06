export function ScorePill({ total, tier }: { total: number; tier: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-semibold tabular-nums tracking-tight">{total}</span>
      <span className="text-muted-foreground text-sm">/100</span>
      <span className="rounded-md border px-1.5 py-0.5 text-xs font-medium">Tier {tier}</span>
    </div>
  )
}
