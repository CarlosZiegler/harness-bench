import type { SideResult } from "@/data/fights"

export function ScreenshotCompare({
  a,
  b,
}: {
  a: SideResult
  b: SideResult
}) {
  const ids = Array.from(
    new Set([...a.screenshots.map((s) => s.id), ...b.screenshots.map((s) => s.id)]),
  )

  if (!ids.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        Screenshots appear here after the fight finishes and e2e capture runs.
        Each screen is shown <strong className="text-foreground">side by side</strong> for
        frontend comparison.
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <div className="sticky top-14 z-30 -mx-1 flex gap-2 border-b bg-background/95 px-1 py-2 backdrop-blur md:hidden">
        <span className="flex-1 truncate text-center text-[11px] font-medium">{a.label}</span>
        <span className="flex-1 truncate text-center text-[11px] font-medium">{b.label}</span>
      </div>

      {ids.map((id, index) => {
        const sa = a.screenshots.find((s) => s.id === id)
        const sb = b.screenshots.find((s) => s.id === id)
        const title = sa?.title ?? sb?.title ?? id
        return (
          <section key={id} className="scroll-mt-24 space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Screen {index + 1} · {id}
                </p>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <Shot
                label={a.label}
                harness={a.harness}
                shot={sa}
                side="A"
              />
              <Shot
                label={b.label}
                harness={b.harness}
                shot={sb}
                side="B"
              />
            </div>
          </section>
        )
      })}
    </div>
  )
}

function Shot({
  label,
  harness,
  shot,
  side,
}: {
  label: string
  harness: string
  side: "A" | "B"
  shot?: { src: string; title: string; note?: string }
}) {
  return (
    <figure className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <figcaption className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            <span className="mr-1.5 text-muted-foreground">{side}.</span>
            {label}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">{harness}</div>
        </div>
      </figcaption>
      {shot ? (
        <a href={shot.src} target="_blank" rel="noreferrer" className="block bg-black/[0.03]">
          <img
            src={shot.src}
            alt={`${label} — ${shot.title}`}
            className="max-h-[560px] w-full object-cover object-top"
            loading="lazy"
          />
        </a>
      ) : (
        <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
          No screenshot yet
        </div>
      )}
      {shot?.note && (
        <p className="border-t px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {shot.note}
        </p>
      )}
    </figure>
  )
}
