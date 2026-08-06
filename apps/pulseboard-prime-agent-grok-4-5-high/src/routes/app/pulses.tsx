import { createFileRoute } from "@tanstack/react-router"
import { PulseCard, PulseEmptyState } from "@/components/app/pulse-card"
import { PulseComposer } from "@/components/app/pulse-composer"
import { Skeleton } from "@/components/ui/skeleton"
import { listPulsesFn } from "@/server/workspace"

export const Route = createFileRoute("/app/pulses")({
  loader: () => listPulsesFn(),
  component: PulsesPage,
  pendingComponent: PulsesPending,
  errorComponent: ({ error }) => (
    <div className="border-destructive/30 bg-destructive/5 rounded-xl border p-6">
      <h2 className="font-medium">Could not load pulses</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        {error.message || "Try refreshing the page."}
      </p>
    </div>
  ),
})

function PulsesPage() {
  const data = Route.useLoaderData()

  return (
    <div className="space-y-8">
      <div>
        <p className="text-muted-foreground text-sm">Pulses</p>
        <h1 className="text-2xl font-semibold tracking-tight">Team feed</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Post an update and browse the latest check-ins from your workspace.
        </p>
      </div>

      <PulseComposer />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">All pulses</h2>
          <span className="text-muted-foreground text-xs">
            {data.pulses.length} shown
          </span>
        </div>
        {data.pulses.length === 0 ? (
          <PulseEmptyState />
        ) : (
          <div className="space-y-3">
            {data.pulses.map((pulse) => (
              <PulseCard key={pulse.id} pulse={pulse} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function PulsesPending() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-40" />
      </div>
      <Skeleton className="h-56 rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
