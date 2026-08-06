import { useState } from "react"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowRight, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/pulseboard/auth-layout"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/sign-up")({ component: SignUpPage })

function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const result = await authClient.signUp.email({ name, email, password })
      if (result.error)
        throw new Error(
          result.error.message ?? "We could not create your account."
        )
      await navigate({ to: "/app" })
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not create your account."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout mode="sign-up">
      <div className="mb-8">
        <span className="mb-5 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary">
          Start with a signal
        </span>
        <h2 className="text-3xl font-semibold tracking-[-0.06em]">
          Give your team a read.
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Create a private workspace and make the next check-in easier.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="sign-up-name">Your name</Label>
          <Input
            id="sign-up-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Alex Morgan"
            autoComplete="name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sign-up-email">Work email</Label>
          <Input
            id="sign-up-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sign-up-password">Password</Label>
          <Input
            id="sign-up-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8+ characters"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="mt-2 h-11 rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ArrowRight />
          )}
          {isLoading ? "Setting up your space…" : "Create workspace"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have a pulse?{" "}
        <Link
          to="/sign-in"
          className="font-semibold text-foreground underline decoration-primary/60 underline-offset-4 hover:text-primary"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
