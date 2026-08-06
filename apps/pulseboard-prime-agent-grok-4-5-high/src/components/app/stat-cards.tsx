/** reui-inspired summary metric cards for the dashboard. */
import { Activity, CalendarDays, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StatCards({
  stats,
}: {
  stats: {
    members: number
    pulsesToday: number
    pulsesThisWeek: number
  }
}) {
  const items = [
    {
      label: "Members",
      value: stats.members,
      hint: "In this workspace",
      icon: Users,
    },
    {
      label: "Pulses today",
      value: stats.pulsesToday,
      hint: "Since midnight",
      icon: Activity,
    },
    {
      label: "This week",
      value: stats.pulsesThisWeek,
      hint: "Monday → now",
      icon: CalendarDays,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="border-border/70 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {item.label}
            </CardTitle>
            <item.icon className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">
              {item.value}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">{item.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function StatCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-border/70 shadow-none">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
