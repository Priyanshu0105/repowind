import { sign, verify } from "hono/jwt"

export interface SessionUser {
  githubId: number
  username: string
  avatarUrl: string
  accessToken: string
}

const SECRET = process.env.SESSION_SECRET || "dev_secret_change_this"

export async function createToken(user: SessionUser): Promise<string> {
  return sign(
    {
      ...user,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    SECRET,
    "HS256"  // ← add this
  )
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const payload = await verify(token, SECRET, "HS256")  // ← add this
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}