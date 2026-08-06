import type { SideResult } from "@/data/fights"

export function CodeCompare({ a, b }: { a: SideResult; b: SideResult }) {
  const ids = Array.from(
    new Set([...a.codeSamples.map((c) => c.id), ...b.codeSamples.map((c) => c.id)]),
  )
  if (!ids.length) {
    return <p className="text-sm text-muted-foreground">Code samples pending.</p>
  }
  return (
    <div className="space-y-8">
      {ids.map((id) => {
        const ca = a.codeSamples.find((c) => c.id === id)
        const cb = b.codeSamples.find((c) => c.id === id)
        const title = ca?.title ?? cb?.title ?? id
        return (
          <div key={id} className="space-y-3">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <CodeBlock label={a.label} code={ca?.code ?? "// n/a"} />
              <CodeBlock label={b.label} code={cb?.code ?? "// n/a"} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-[#0c0c0e] text-[12.5px] leading-relaxed text-zinc-100">
      <div className="border-b border-white/10 px-3 py-2 text-xs text-zinc-400">{label}</div>
      <pre className="overflow-x-auto p-3">
        <code>{code}</code>
      </pre>
    </div>
  )
}
