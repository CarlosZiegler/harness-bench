import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { MoodBadge } from "@/components/app/mood-badge"
import { formatRelativeTime } from "@/lib/format"
import type { PulseMood } from "@/db/schema"

export type PulseItem = {
  id: string
  mood: PulseMood
  body: string
  createdAt: Date | string
  author: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

export function PulseCard({ pulse }: { pulse: PulseItem }) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="flex gap-3 p-4">
        <Avatar size="sm">
          {pulse.author.image ? (
            <AvatarImage src={pulse.author.image} alt={pulse.author.name} />
          ) : null}
          <AvatarFallback>{initials(pulse.author.name || "U")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{pulse.author.name}</p>
            <MoodBadge mood={pulse.mood} />
            <span className="text-muted-foreground text-xs">
              {formatRelativeTime(pulse.createdAt)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-pretty">{pulse.body}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function PulseEmptyState({
  title = "No pulses yet",
  description = "Share how the day is going so your team can stay aligned.",
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="border-border/70 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
      <div className="bg-muted mb-3 flex size-12 items-center justify-center rounded-full text-xl">
        📡
      </div>
      <h3 className="text-base font-medium">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm text-pretty">
        {description}
      </p>
    </div>
  )
}
