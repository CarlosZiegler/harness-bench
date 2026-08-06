import { ArrowUpRight, Check, ShieldCheck } from "lucide-react"

import { BrandMark } from "@/components/pulseboard/brand-mark"

export function AuthLayout({
  children,
  mode,
}: {
  children: React.ReactNode
  mode: "sign-in" | "sign-up"
}) {
  return (
    <main className="auth-page">
      <div className="auth-grid">
        <section className="auth-pitch">
          <BrandMark />
          <div className="auth-pitch-copy">
            <p className="eyebrow text-primary">A better team signal</p>
            <h1>Make the room easier to read.</h1>
            <p className="mt-5 max-w-sm text-[15px] leading-7 text-muted-foreground">
              Pulseboard gives your team a lightweight place to share context,
              spot friction, and keep momentum visible.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                "One clear signal per person",
                "A shared read on the week",
                "Less status theater, more context",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 text-sm text-foreground/80"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-primary/15 text-primary">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="auth-pitch-footer">
            <ShieldCheck className="size-4 text-primary" />
            <span>Your workspace stays private to your team.</span>
            <ArrowUpRight className="ml-auto size-4" />
          </div>
        </section>
        <section className="auth-form-panel">
          <div className="w-full max-w-sm">
            {children}
            <p className="mt-8 text-center text-[11px] leading-5 text-muted-foreground">
              By continuing, you agree to keep your team’s space thoughtful and
              useful.
            </p>
          </div>
        </section>
      </div>
      <div className="auth-mode-hint">
        {mode === "sign-in" ? "New here?" : "Already part of the room?"}
      </div>
    </main>
  )
}
