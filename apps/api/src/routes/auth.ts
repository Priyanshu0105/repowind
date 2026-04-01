import { Hono } from "hono"
import { createToken, verifyToken } from "../lib/session"

type Env = {
  Variables: {
    user: any
  }
}

const auth = new Hono<Env>()

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
const WEB_URL = process.env.WEB_URL || "http://localhost:3000"
const API_URL = process.env.API_URL || "http://localhost:8080"
const isProduction = process.env.NODE_ENV === "production"

auth.get("/github", (c) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${API_URL}/auth/github/callback`,
    scope: "read:user repo",
  })
  return c.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

auth.get("/github/callback", async (c) => {
  const code = c.req.query("code")
  if (!code) return c.json({ error: "No code provided" }, 400)

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const tokenData = await tokenRes.json() as any
  if (tokenData.error) return c.json({ error: tokenData.error_description }, 400)

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github.v3+json",
    },
  })

  const githubUser = await userRes.json() as any

  const jwt = await createToken({
    githubId: githubUser.id,
    username: githubUser.login,
    avatarUrl: githubUser.avatar_url,
    accessToken: tokenData.access_token,
  })

  const cookieOptions = isProduction
    ? `HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=None; Secure`
    : `HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`

  c.header("Set-Cookie", `token=${jwt}; ${cookieOptions}`)
  return c.redirect(`${WEB_URL}/dashboard`)
})

auth.get("/me", async (c) => {
  const cookie = c.req.header("cookie") || ""
  const match = cookie.match(/token=([^;]+)/)
  const token = match ? match[1] : null
  if (!token) return c.json({ user: null })

  const user = await verifyToken(token)
  if (!user) return c.json({ user: null })

  return c.json({
    user: {
      username: user.username,
      avatarUrl: user.avatarUrl,
    },
  })
})

auth.post("/logout", (c) => {
  const cookieOptions = isProduction
    ? "HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure"
    : "HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  c.header("Set-Cookie", `token=; ${cookieOptions}`)
  return c.json({ success: true })
})

export default auth