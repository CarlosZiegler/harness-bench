import type { LucideIcon } from "lucide-react"

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  detail: string
  icon: LucideIcon
  accent: "lime" | "blue" | "orange"
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon stat-icon-${accent}`}>
        <Icon className="size-4" />
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
            {value}
          </p>
        </div>
        <span className="mb-1 text-right text-[11px] leading-4 font-medium text-muted-foreground">
          {detail}
        </span>
      </div>
    </div>
  )
}
