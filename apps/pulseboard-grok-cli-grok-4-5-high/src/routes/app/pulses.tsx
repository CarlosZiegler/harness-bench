import { createFileRoute, useRouter } from "@tanstack/react-router"
import { toast } from "sonner"
import { PulseComposer } from "@/components/app/pulse-composer"
import { PulseFeed } from "@/components/app/pulse-feed"
import { getPulsesData, submitPulse } from "@/server/session"

export const Route = createFileRoute("/app/pulses")({
  loader: async () => getPulsesData(),
  component: PulsesPage,
})

function PulsesPage() {
  const data = Route.useLoaderData()
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pulses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Post an update and browse the full feed for{" "}
          <span className="font-medium text-foreground">{data.workspace.name}</span>.
        </p>
      </div>

      <PulseComposer
        onSubmit={async ({ mood, body }) => {
          await submitPulse({ data: { mood, body } })
          toast.success("Pulse posted")
          await router.invalidate()
        }}
      />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Workspace feed
        </h2>
        <PulseFeed pulses={data.pulses} />
      </div>
    </div>
  )
}
