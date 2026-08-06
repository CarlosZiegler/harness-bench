import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRight, Check, MoveUpRight, TrendingUp } from "lucide-react"

import { BrandMark } from "@/components/pulseboard/brand-mark"
import { MoodDot } from "@/components/pulseboard/mood-dot"

export const Route = createFileRoute("/")({ component: LandingPage })

function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <BrandMark />
        <div className="flex items-center gap-2">
          <Link
            to="/sign-in"
            className="hidden px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
          >
            Get started <ArrowRight className="size-4" />
          </Link>
        </div>
      </nav>
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <span className="status-dot" /> Team context, in one glance
          </div>
          <h1>
            A clearer read on your team
            <span className="text-primary">’s week.</span>
          </h1>
          <p>
            Pulseboard is the lightweight team pulse that turns small check-ins
            into better conversations, fewer surprises, and steadier momentum.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/sign-up"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
            >
              Create your workspace <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/sign-in"
              className="group inline-flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Already have an account{" "}
              <MoveUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" /> Private by default
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" /> Built for small teams
            </span>
          </div>
        </div>
        <div className="landing-visual" aria-label="Pulseboard preview">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="signal-core">
            <span className="signal-core-dot" />
            <span className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
              team signal
            </span>
            <strong>
              In the room<span className="text-primary">.</span>
            </strong>
            <span className="text-xs text-muted-foreground">
              3 pulses shared today
            </span>
          </div>
          <div className="preview-card preview-card-top">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Today’s read</span>
              <TrendingUp className="size-4 text-primary" />
            </div>
            <div className="mt-5 flex items-end gap-2">
              <strong className="text-4xl tracking-[-0.08em]">84%</strong>
              <span className="mb-1.5 text-xs text-primary">+12%</span>
            </div>
            <div className="mini-bars">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="preview-card preview-card-bottom">
            <div className="flex items-center gap-2">
              <span className="avatar avatar-xs">AM</span>
              <span className="text-xs font-semibold">Alex shared a pulse</span>
              <span className="ml-auto">
                <MoodDot mood="great" />
              </span>
            </div>
            <p className="mt-3 text-sm leading-5 text-foreground/80">
              “The new flow is feeling solid. Ready for a small review.”
            </p>
          </div>
        </div>
      </section>
      <section className="landing-proof">
        <div>
          <span className="eyebrow">The useful middle ground</span>
          <h2>Just enough structure to keep people connected.</h2>
        </div>
        <div className="landing-proof-grid">
          <div>
            <span className="proof-number">01</span>
            <h3>Quick to share</h3>
            <p>
              A pulse takes less than a minute, so context doesn’t become
              another meeting.
            </p>
          </div>
          <div>
            <span className="proof-number">02</span>
            <h3>Easy to scan</h3>
            <p>
              See where the team has momentum and where a little attention could
              help.
            </p>
          </div>
          <div>
            <span className="proof-number">03</span>
            <h3>Made for trust</h3>
            <p>
              Private workspaces and honest, human-sized updates by default.
            </p>
          </div>
        </div>
      </section>
      <footer className="landing-footer">
        <BrandMark />
        <span>Small signals. Better weeks.</span>
        <span className="ml-auto hidden sm:inline">© 2026 Pulseboard</span>
      </footer>
    </main>
  )
}
