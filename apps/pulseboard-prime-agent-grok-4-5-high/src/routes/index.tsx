import { Link, createFileRoute } from "@tanstack/react-router"
import { Activity, ArrowRight, Radio, ShieldCheck, Users } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { getSessionFn } from "@/server/session"

export const Route = createFileRoute("/")({
  loader: async () => {
    const session = await getSessionFn()
    return { isAuthed: Boolean(session) }
  },
  component: LandingPage,
})

function LandingPage() {
  const { isAuthed } = Route.useLoaderData()

  return (
    <div className="from-background via-background to-muted/40 min-h-svh bg-linear-to-b">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Activity className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Pulseboard</span>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          {isAuthed ? (
            <Button render={<Link to="/app" />}>
              Open app
              <ArrowRight data-icon="inline-end" />
            </Button>
          ) : (
            <>
              <Button variant="ghost" render={<Link to="/sign-in" />}>
                Sign in
              </Button>
              <Button render={<Link to="/sign-up" />}>Get started</Button>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-10 md:pt-16">
        <section className="mx-auto max-w-2xl text-center">
          <div className="bg-muted text-muted-foreground mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
            <Radio className="size-3.5" />
            Team pulse, without the standup theater
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Know how the team is really doing — in one glance
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
            Pulseboard is a lightweight status dashboard. Post a mood and a short
            note, spot blockers early, and keep everyone aligned without another
            meeting.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" render={<Link to={isAuthed ? "/app" : "/sign-up"} />}>
              {isAuthed ? "Go to dashboard" : "Start free"}
              <ArrowRight data-icon="inline-end" />
            </Button>
            {!isAuthed ? (
              <Button size="lg" variant="outline" render={<Link to="/sign-in" />}>
                I already have an account
              </Button>
            ) : null}
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Radio,
              title: "Daily pulses",
              body: "Great, OK, or blocked — plus a short note. Fast enough to do every day.",
            },
            {
              icon: Users,
              title: "Shared workspace",
              body: "A personal workspace is created on first login so you can start posting immediately.",
            },
            {
              icon: ShieldCheck,
              title: "Session-aware",
              body: "Secure email/password auth with protected app routes and server-side checks.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="border-border/70 bg-card rounded-2xl border p-5 shadow-sm"
            >
              <div className="bg-muted mb-3 flex size-10 items-center justify-center rounded-xl">
                <feature.icon className="size-4" />
              </div>
              <h2 className="font-medium">{feature.title}</h2>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {feature.body}
              </p>
            </div>
          ))}
        </section>

        <section className="border-border/70 bg-card mt-10 overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-border/70 flex items-center justify-between border-b px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-emerald-500" />
              <div className="size-2.5 rounded-full bg-amber-400" />
              <div className="size-2.5 rounded-full bg-sky-400" />
            </div>
            <span className="text-muted-foreground text-xs">Live team feed</span>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-3">
            {[
              {
                name: "Ava",
                mood: "✨ Great",
                note: "Shipped the invite flow. Pairing on docs next.",
              },
              {
                name: "Noah",
                mood: "🚧 Blocked",
                note: "Waiting on API keys for staging webhooks.",
              },
              {
                name: "Mia",
                mood: "🙂 OK",
                note: "Cleaning up dashboard empty states.",
              },
            ].map((row) => (
              <div
                key={row.name}
                className="bg-muted/40 rounded-xl border border-transparent p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{row.name}</p>
                  <span className="text-xs">{row.mood}</span>
                </div>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {row.note}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
