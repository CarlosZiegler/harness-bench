import type { Mood } from "@/lib/pulseboard"

import { moodMeta } from "@/lib/pulseboard"
import { cn } from "@/lib/utils"

export function MoodDot({
  mood,
  className,
}: {
  mood: Mood
  className?: string
}) {
  return (
    <span
      aria-label={moodMeta[mood].label}
      className={cn("mood-dot", moodMeta[mood].className, className)}
    />
  )
}
