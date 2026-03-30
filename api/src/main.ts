import { serve } from "@hono/node-server"
import { createAppContext } from "./composition-root.js"
import { createHttpApp } from "./interfaces/http/app.js"

const port = Number(process.env.PORT ?? 8787)
const ctx = createAppContext()
const app = createHttpApp(ctx)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[ERA API] http://localhost:${info.port} (clean architecture)`)
})
