import { ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { MoodDot } from "@/components/pulseboard/mood-dot"
import type { PulseWithAuthor } from "@/db/schema"
import { formatRelativeTime, getInitials, moodMeta } from "@/lib/pulseboard"

export function PulseCard({
  pulse,
  featured = false,
}: {
  pulse: PulseWithAuthor
  featured?: boolean
}) {
  const mood = moodMeta[pulse.mood]

  return (
    <article
      className={`pulse-card group ${featured ? "pulse-card-featured" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="avatar avatar-sm">
          {pulse.author.image ? (
            <img src={pulse.author.image} alt="" />
          ) : (
            getInitials(pulse.author.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{pulse.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(pulse.createdAt)}
            </span>
            <Badge className={`mood-badge ${mood.className}`}>
              <MoodDot mood={pulse.mood} />
              {mood.label}
            </Badge>
          </div>
          <p className="mt-2.5 text-[15px] leading-6 text-foreground/85">
            {pulse.body}
          </p>
        </div>
        <ArrowUpRight className="mt-0.5 size-4 text-muted-foreground/0 transition group-hover:text-muted-foreground" />
      </div>
    </article>
  )
}
