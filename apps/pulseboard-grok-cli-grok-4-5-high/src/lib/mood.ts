import type { PulseMood } from "@/db/schema"

export const MOODS = ["great", "ok", "blocked"] as const satisfies readonly PulseMood[]

export const moodConfig: Record<
  PulseMood,
  {
    label: string
    emoji: string
    description: string
    className: string
    badgeClass: string
  }
> = {
  great: {
    label: "Great",
    emoji: "✨",
    description: "Shipping, energized, unblocked",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    badgeClass:
      "bg-emerald-500/15 text-emerald-700 border-emerald-500/25 dark:text-emerald-300",
  },
  ok: {
    label: "OK",
    emoji: "🙂",
    description: "Steady progress, nothing urgent",
    className:
      "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    badgeClass:
      "bg-sky-500/15 text-sky-700 border-sky-500/25 dark:text-sky-300",
  },
  blocked: {
    label: "Blocked",
    emoji: "🚧",
    description: "Need help or waiting on something",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    badgeClass:
      "bg-amber-500/15 text-amber-800 border-amber-500/25 dark:text-amber-300",
  },
}

export function formatRelativeTime(iso: string) {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}
