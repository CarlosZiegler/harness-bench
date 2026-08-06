/**
 * Production server for TanStack Start on Bun.
 * Serves SSR via the built fetch handler and static client assets from dist/client.
 */
import { existsSync, statSync } from "node:fs"
import { extname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { safeJoin } from "./src/lib/safe-path"

const root = fileURLToPath(new URL(".", import.meta.url))
const clientDir = join(root, "dist", "client")
const serverEntry = join(root, "dist", "server", "server.js")

const securityHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
}

const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
}

const { default: app } = await import(serverEntry)

const port = Number(process.env.PORT ?? 3000)
const hostname = process.env.HOSTNAME ?? "0.0.0.0"

const server = Bun.serve({
  port,
  hostname,
  idleTimeout: 60,
  async fetch(request) {
    const url = new URL(request.url)

    if (request.method === "GET" || request.method === "HEAD") {
      const assetPath = safeJoin(clientDir, url.pathname)
      if (assetPath && existsSync(assetPath) && statSync(assetPath).isFile()) {
        const type = mime[extname(assetPath)] ?? "application/octet-stream"
        const headers = {
          ...securityHeaders,
          "content-type": type,
          "cache-control": url.pathname.startsWith("/assets/")
            ? "public, max-age=31536000, immutable"
            : "public, max-age=3600",
        }
        if (request.method === "HEAD") {
          return new Response(null, { headers })
        }
        return new Response(Bun.file(assetPath), { headers })
      }
    }

    const response = await app.fetch(request)
    const headers = new Headers(response.headers)
    for (const [name, value] of Object.entries(securityHeaders)) {
      headers.set(name, value)
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
})

console.log(`Pulseboard listening on http://${server.hostname}:${server.port}`)
