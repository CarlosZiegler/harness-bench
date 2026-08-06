import { Activity } from "lucide-react"

import { cn } from "@/lib/utils"

export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground shadow-[0_0_24px_-8px_var(--primary)]">
        <Activity className="size-4.5" strokeWidth={2.5} />
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-[-0.02em]">
          pulseboard
        </span>
      )}
    </div>
  )
}
