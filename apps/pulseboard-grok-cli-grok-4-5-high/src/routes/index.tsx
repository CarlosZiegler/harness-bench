import { Link, createFileRoute } from "@tanstack/react-router"
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Radio,
  Sparkles,
  Users,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession } from "@/server/session"

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const session = await getSession()
      return { user: session?.user ?? null }
    } catch {
      return { user: null }
    }
  },
  component: LandingPage,
})

function LandingPage() {
  const { user } = Route.useLoaderData()

  return (
    <div className="relative min-h-svh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"
      />
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Radio className="size-4" aria-hidden />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Pulseboard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button render={<Link to="/app" />}>
              Open app
              <ArrowRight className="size-4" data-icon="inline-end" />
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

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5 px-2.5 py-1">
            <Sparkles className="size-3" aria-hidden />
            Team pulse, without the standup noise
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Know how your team is really doing
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Pulseboard is a lightweight status board. Share a mood, drop a short
            note, and see blockers and wins in one calm feed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Button size="lg" render={<Link to="/app" />}>
                Go to dashboard
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            ) : (
              <>
                <Button size="lg" render={<Link to="/sign-up" />}>
                  Create free account
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  render={<Link to="/sign-in" />}
                >
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Activity,
              title: "Daily pulses",
              body: "Great, OK, or blocked — plus a sentence of context. Done in under a minute.",
            },
            {
              icon: Users,
              title: "Workspace feed",
              body: "See the whole team’s pulse in one place. Spot who needs help before standup.",
            },
            {
              icon: CheckCircle2,
              title: "Simple by design",
              body: "No tickets, no rituals. Just a shared signal so work stays human and clear.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="shadow-sm">
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted">
                  <feature.icon className="size-4 text-foreground" aria-hidden />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.body}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-10 overflow-hidden border-dashed shadow-sm">
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2 sm:items-center">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Ready when your team is
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign up, get a personal workspace instantly, and post your first
                pulse. No invites required to start.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button render={<Link to={user ? "/app" : "/sign-up"} />}>
                {user ? "Open dashboard" : "Start Pulseboard"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Pulseboard — a focused team pulse dashboard
      </footer>
    </div>
  )
}
