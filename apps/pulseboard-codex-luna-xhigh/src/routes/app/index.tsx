import { createFileRoute, useRouter } from "@tanstack/react-router"
import { Activity, CalendarDays, UsersRound } from "lucide-react"

import { EmptyState } from "@/components/pulseboard/empty-state"
import { PulseCard } from "@/components/pulseboard/pulse-card"
import { PulseComposer } from "@/components/pulseboard/pulse-composer"
import { StatCard } from "@/components/pulseboard/stat-card"
import { useAppData } from "@/components/pulseboard/app-shell"

export const Route = createFileRoute("/app/")({ component: DashboardPage })

function DashboardPage() {
  const data = useAppData()
  const router = useRouter()
  const firstName = data.currentUser.name.split(" ")[0] ?? data.currentUser.name

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">
            {new Intl.DateTimeFormat("en", {
              weekday: "long",
              month: "short",
              day: "numeric",
            }).format(new Date())}
          </p>
          <h1 className="mt-2">
            Good morning, {firstName}
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            A quick read on the room, so your team can spend more time moving
            the work forward.
          </p>
        </div>
        <div className="signal-pill">
          <span className="status-dot" /> This week is in view
        </div>
      </section>

      <section
        className="grid gap-3 sm:grid-cols-3"
        aria-label="Workspace summary"
      >
        <StatCard
          label="Team members"
          value={data.memberCount}
          detail="in your space"
          icon={UsersRound}
          accent="lime"
        />
        <StatCard
          label="Pulses today"
          value={data.pulsesToday}
          detail={data.pulsesToday === 0 ? "be the first" : "signals shared"}
          icon={Activity}
          accent="blue"
        />
        <StatCard
          label="This week"
          value={data.pulsesThisWeek}
          detail="total pulses"
          icon={CalendarDays}
          accent="orange"
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <section className="section-card">
          <div className="section-card-header">
            <div>
              <p className="eyebrow">Live from the team</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                Recent pulses
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {data.recentPulses.length} latest
            </span>
          </div>
          <div className="section-card-body p-0">
            {data.recentPulses.length > 0 ? (
              <div className="divide-y divide-border/70">
                {data.recentPulses.slice(0, 5).map((pulse) => (
                  <PulseCard key={pulse.id} pulse={pulse} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Your board is quiet"
                body="Share the first pulse of the week and give the team a small signal to build on."
              />
            )}
          </div>
        </section>
        <PulseComposer onCreated={() => router.invalidate()} />
      </div>
    </div>
  )
}
