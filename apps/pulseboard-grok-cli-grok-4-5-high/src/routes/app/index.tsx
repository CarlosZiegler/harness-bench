import { Link, createFileRoute, useRouter } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { PulseComposer } from "@/components/app/pulse-composer"
import { PulseFeed } from "@/components/app/pulse-feed"
import { StatsCards } from "@/components/app/stats-cards"
import { Button } from "@/components/ui/button"
import { getDashboardData, submitPulse } from "@/server/session"
import { getRouteApi } from "@tanstack/react-router"

const appRoute = getRouteApi("/app")

export const Route = createFileRoute("/app/")({
  loader: async () => getDashboardData(),
  component: DashboardPage,
})

function DashboardPage() {
  const data = Route.useLoaderData()
  const parent = appRoute.useLoaderData()
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {parent.user.name.split(" ")[0]}. Here&apos;s the pulse
            of <span className="font-medium text-foreground">{data.workspace.name}</span>.
          </p>
        </div>
        <Button variant="outline" size="sm" render={<Link to="/app/pulses" />}>
          All pulses
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
      </div>

      <StatsCards stats={data.stats} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <PulseComposer
            onSubmit={async ({ mood, body }) => {
              await submitPulse({ data: { mood, body } })
              toast.success("Pulse posted")
              await router.invalidate()
            }}
          />
        </div>
        <div className="space-y-3 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Recent pulses
            </h2>
          </div>
          <PulseFeed
            pulses={data.pulses}
            emptyAction={
              <p className="text-xs text-muted-foreground">
                Use the composer to share your first update.
              </p>
            }
          />
        </div>
      </div>
    </div>
  )
}
