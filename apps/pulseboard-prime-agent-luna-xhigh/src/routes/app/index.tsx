import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { PulseCard, PulseEmptyState } from "@/components/app/pulse-card"
import { PulseComposer } from "@/components/app/pulse-composer"
import { StatCards } from "@/components/app/stat-cards"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboardFn } from "@/server/workspace"

export const Route = createFileRoute("/app/")({
  loader: () => getDashboardFn(),
  component: DashboardPage,
  pendingComponent: DashboardPending,
  errorComponent: () => (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <h2 className="font-medium">Could not load dashboard</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Try refreshing the page and check again.
      </p>
    </div>
  ),
})

function DashboardPage() {
  const data = Route.useLoaderData()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {data.workspace.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A snapshot of membership and recent team energy.
          </p>
        </div>
        <Button variant="outline" render={<Link to="/app/pulses" />}>
          View all pulses
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>

      <StatCards stats={data.stats} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Recent pulses</h2>
            <span className="text-xs text-muted-foreground">
              Last {data.recentPulses.length} updates
            </span>
          </div>
          {data.recentPulses.length === 0 ? (
            <PulseEmptyState
              title="Quiet so far"
              description="No pulses yet today. Post the first one and set the tone for the team."
            />
          ) : (
            <div className="space-y-3">
              {data.recentPulses.map((pulse) => (
                <PulseCard key={pulse.id} pulse={pulse} />
              ))}
            </div>
          )}
        </section>

        <section>
          <PulseComposer compact />
        </section>
      </div>
    </div>
  )
}

function DashboardPending() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}
