import type { TaskDefinition } from "../types/index.ts";

/**
 * Launchpad — alternate large task (feature-request board).
 * Same stack, different domain — reduces overfitting to Pulseboard.
 */
export const launchpadTask: TaskDefinition = {
  id: "launchpad",
  title: "Launchpad — product feedback board",
  difficulty: "large",
  summary:
    "A feedback / feature-request board with auth, projects, voting, board UI, Postgres, Docker Compose.",
  stack: [
    "TanStack Start",
    "Drizzle ORM",
    "PostgreSQL",
    "Better Auth",
    "shadcn/ui",
    "re-ui patterns",
    "Tailwind CSS v4",
    "Docker + Compose",
  ],
  mustHave: [
    "TanStack Start + shadcn start preset",
    "Better Auth email/password",
    "Postgres + Drizzle (users, projects, requests, votes)",
    "Projects + feature requests with status",
    "Upvote one per user per request",
    "Board UI with empty/loading states",
    "Protected routes",
    "Dockerfile + docker-compose",
    "README + .env.example + tests",
  ],
  niceToHave: ["Drag-and-drop status", "Comments", "Landing page polish"],
  forbidden: ["No secrets", "No Next.js", "Stay in app directory"],
  scaffold: {
    command:
      "bunx --bun shadcn@latest init --preset b0 --template start --pointer --yes --force -n app",
    createsInPlace: true,
  },
  prompts: {
    build: "tasks/launchpad.build.md",
    validate: "tasks/launchpad.validate.md",
  },
  runtimeChecks: ["install", "typecheck", "build", "docker_build", "compose_up"],
  scoringProfile: "fullstack-webdev",
};
