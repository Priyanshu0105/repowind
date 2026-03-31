import { Context, Next } from "hono"
import { verifyToken } from "../lib/session"

export async function requireAuth(c: Context, next: Next) {
  const cookie = c.req.header("cookie") || ""
  const match = cookie.match(/token=([^;]+)/)
  const token = match ? match[1] : null

  if (!token) return c.json({ error: "Unauthorized" }, 401)

  const user = await verifyToken(token)
  if (!user) return c.json({ error: "Invalid session" }, 401)

  c.set("user", user)
  await next()
}