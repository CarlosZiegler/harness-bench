import { createFileRoute, useRouter } from "@tanstack/react-router"

import { EmptyState } from "@/components/pulseboard/empty-state"
import { PulseCard } from "@/components/pulseboard/pulse-card"
import { PulseComposer } from "@/components/pulseboard/pulse-composer"
import { useAppData } from "@/components/pulseboard/app-shell"
import { listPulses } from "@/server/pulse.functions"

export const Route = createFileRoute("/app/pulses")({
  loader: () => listPulses(),
  component: PulsesPage,
})

function PulsesPage() {
  const data = useAppData()
  const pulses = Route.useLoaderData()
  const router = useRouter()

  return (
    <div className="page-stack page-stack-narrow">
      <section className="page-heading">
        <div>
          <p className="eyebrow">The team signal</p>
          <h1 className="mt-2">Pulses</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Short, human updates that make the invisible parts of teamwork
            easier to see.
          </p>
        </div>
      </section>
      <PulseComposer onCreated={() => router.invalidate()} />
      <section className="section-card">
        <div className="section-card-header">
          <div>
            <p className="eyebrow">All signals</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              The latest from {data.workspace.name}
            </h2>
          </div>
        </div>
        <div className="section-card-body p-0">
          {pulses.length > 0 ? (
            <div className="divide-y divide-border/70">
              {pulses.map((pulse) => (
                <PulseCard key={pulse.id} pulse={pulse} featured />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No signals yet"
              body="Your first pulse will set the tone for this workspace."
            />
          )}
        </div>
      </section>
    </div>
  )
}
