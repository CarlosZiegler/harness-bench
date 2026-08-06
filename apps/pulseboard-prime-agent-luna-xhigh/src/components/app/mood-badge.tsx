import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PulseMood } from "@/db/schema"

const moodConfig: Record<
  PulseMood,
  { label: string; className: string; emoji: string }
> = {
  great: {
    label: "Great",
    emoji: "✨",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  ok: {
    label: "OK",
    emoji: "🙂",
    className: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  blocked: {
    label: "Blocked",
    emoji: "🚧",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  },
}

export function MoodBadge({
  mood,
  className,
}: {
  mood: PulseMood
  className?: string
}) {
  const config = moodConfig[mood]
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-medium", config.className, className)}
    >
      <span aria-hidden>{config.emoji}</span>
      {config.label}
    </Badge>
  )
}

export const moodOptions = [
  { value: "great" as const, label: "Great", hint: "Shipping and unblocked" },
  { value: "ok" as const, label: "OK", hint: "Steady progress" },
  {
    value: "blocked" as const,
    label: "Blocked",
    hint: "Need help or a decision",
  },
]
