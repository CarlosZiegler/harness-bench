import { useState } from "react"
import { LoaderCircle, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createPulse } from "@/server/pulse.functions"
import type { Mood } from "@/lib/pulseboard"

import { moodMeta } from "@/lib/pulseboard"
import { MoodDot } from "@/components/pulseboard/mood-dot"

const moods: Mood[] = ["great", "ok", "blocked"]

export function PulseComposer({ onCreated }: { onCreated?: () => void }) {
  const [mood, setMood] = useState<Mood>("great")
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (!body.trim()) {
      setError("Add a short note so your team has a signal to read.")
      return
    }

    setIsSaving(true)
    try {
      await createPulse({ data: { mood, body: body.trim() } })
      setBody("")
      onCreated?.()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not save that pulse."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="composer-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Share a pulse</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
            How are things feeling?
          </h2>
        </div>
        <span className="hidden rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground sm:block">
          Private to your workspace
        </span>
      </div>
      <div className="mt-5 grid gap-4">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="A quick note about your momentum, context, or where you need a hand…"
          maxLength={280}
          aria-label="Pulse note"
        />
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Choose your mood"
          >
            {moods.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={mood === option}
                onClick={() => setMood(option)}
                className={`mood-choice ${mood === option ? "mood-choice-selected" : ""} ${moodMeta[option].className}`}
              >
                <MoodDot mood={option} />
                {moodMeta[option].label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-xs text-muted-foreground">
              {body.length}/280
            </span>
            <Button
              type="submit"
              disabled={isSaving || !body.trim()}
              className="h-9 rounded-xl px-3.5"
            >
              {isSaving ? <LoaderCircle className="animate-spin" /> : <Send />}
              {isSaving ? "Posting" : "Post pulse"}
            </Button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  )
}
