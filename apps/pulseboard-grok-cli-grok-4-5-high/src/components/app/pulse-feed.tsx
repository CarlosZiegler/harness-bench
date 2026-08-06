import { Activity } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"
import { formatRelativeTime, moodConfig } from "@/lib/mood"
import type { PulseMood } from "@/db/schema"
import { cn } from "@/lib/utils"

export type PulseItem = {
  id: string
  mood: PulseMood
  body: string
  createdAt: string
  authorId: string
  authorName: string
  authorImage: string | null
  authorEmail: string
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function PulseFeed({
  pulses,
  emptyAction,
}: {
  pulses: PulseItem[]
  emptyAction?: React.ReactNode
}) {
  if (pulses.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No pulses yet"
        description="Share how things are going so the team can stay aligned. A short note is enough."
        action={emptyAction}
      />
    )
  }

  return (
    <ul className="space-y-3" aria-label="Pulse feed">
      {pulses.map((p) => {
        const mood = moodConfig[p.mood]
        return (
          <li key={p.id}>
            <Card className="shadow-sm transition-colors hover:bg-muted/20">
              <CardContent className="flex gap-3 p-4">
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className="text-xs font-medium">
                    {initials(p.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{p.authorName}</span>
                    <Badge
                      variant="outline"
                      className={cn("gap-1 font-normal", mood.badgeClass)}
                    >
                      <span aria-hidden>{mood.emoji}</span>
                      {mood.label}
                    </Badge>
                    <time
                      className="text-xs text-muted-foreground"
                      dateTime={p.createdAt}
                      title={new Date(p.createdAt).toLocaleString()}
                    >
                      {formatRelativeTime(p.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                    {p.body}
                  </p>
                </div>
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}

export function PulseFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="shadow-sm">
          <CardContent className="flex gap-3 p-4">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
