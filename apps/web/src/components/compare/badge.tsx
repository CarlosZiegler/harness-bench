import type { ReactNode } from "react"

const styles: Record<string, string> = {
  default: "bg-muted text-foreground",
  win: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  lose: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  tie: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  na: "bg-muted text-muted-foreground",
  A: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  B: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  C: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  D: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  planned: "bg-muted text-muted-foreground",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  running: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode
  tone?: keyof typeof styles | string
}) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
        (styles[tone] ?? styles.default)
      }
    >
      {children}
    </span>
  )
}
