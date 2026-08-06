import { Sparkles } from "lucide-react"

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <span className="grid size-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
        <Sparkles className="size-4" />
      </span>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm leading-5 text-muted-foreground">
        {body}
      </p>
    </div>
  )
}
