import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="border-b border-border/80 bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-foreground text-background text-xs">
            HB
          </span>
          <span>Harness Bench</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          <NavLink to="/" active={active === "/"}>
            Overview
          </NavLink>
          <NavLink
            to="/fights/$fightId"
            params={{ fightId: "fair-fight-1" }}
            active={active?.includes("fair-fight-1") ?? false}
          >
            Fight #1
          </NavLink>
          <NavLink
            to="/fights/$fightId"
            params={{ fightId: "fair-fight-2" }}
            active={active?.includes("fair-fight-2") ?? false}
          >
            Fight #2
          </NavLink>
          <NavLink to="/matrix" active={active === "/matrix"}>
            Matrix
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

function NavLink({
  to,
  params,
  active,
  children,
}: {
  to: "/" | "/matrix" | "/fights/$fightId"
  params?: { fightId: string }
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      params={params as never}
      className={
        "rounded-md px-3 py-1.5 transition-colors " +
        (active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")
      }
    >
      {children}
    </Link>
  )
}
