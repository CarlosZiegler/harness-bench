import * as React from "react"
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { Activity, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { getSessionFn } from "@/server/session"

export const Route = createFileRoute("/sign-up")({
  loader: async () => {
    const session = await getSessionFn()
    if (session) {
      throw redirect({ to: "/app" })
    }
    return null
  },
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = useNavigate()
  const [pending, setPending] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get("name") ?? "").trim()
    const email = String(data.get("email") ?? "").trim()
    const password = String(data.get("password") ?? "")

    if (!name || !email || password.length < 8) {
      toast.error("Please fill in all fields (password min 8 characters)")
      return
    }

    setPending(true)
    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      })
      if (result.error) {
        toast.error(result.error.message || "Could not create account")
        return
      }
      toast.success("Account created")
      await navigate({ to: "/app" })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not create account",
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="from-background to-muted/30 flex min-h-svh items-center justify-center bg-linear-to-b px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl">
            <Activity className="size-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="text-muted-foreground text-sm">
            Your personal workspace is ready after sign-up.
          </p>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Sign up</CardTitle>
            <CardDescription>
              Email and password is all you need to start.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="Jordan Lee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link
                to="/sign-in"
                className="text-foreground font-medium underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
