import { createCookieSessionStorage, redirect } from "@remix-run/node"
import type { User } from "~/types"
import { logger } from "../logger"
import { getUserById } from "./user.server"
import { SESSION_MAX_AGE } from "~/config"
// import { toLocaleString } from "../utils"
const SESSION_SECRET = process.env.SESSION_SECRET
if (!SESSION_SECRET) throw Error("session secret is not set")

// creates SessionStorage Instance -------------------------
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
})

// Sets session called "userId"  -------------------------
// used in [`signin.server.ts`]
export async function createUserSession(
  userId: number,
  accessToken: string,
  redirectPath: string,
) {
  const session = await sessionStorage.getSession()
  session.set("userId", userId)
  session.set("accessToken", accessToken)
  return redirect(redirectPath, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  })
}

// Destroys the user session -------------------------
// used in [`auth.signout.tsx`]
export async function destroyUserSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  })
}

/**
 * Gets Session from Request Headers
 */
export async function getSession(request: Request): Promise<{
  userId: number | null
  accessToken: string | null
}> {
  logger.debug(`👑 getSession: request ${request.url}, ${request.method}`)

  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  const userId = session.get("userId")
  const accessToken = session.get("accessToken")

  if (!userId || !accessToken) return { userId: null, accessToken: null }

  return { userId: userId, accessToken: accessToken }
}

/**
 * Get User From Session
 */
export async function getUserFromSession(
  request: Request,
): Promise<{ user: User | null; refreshUser: User | null }> {
  logger.debug(
    `👑 getUserFromSession: request ${request.url}, ${request.method}`,
  )

  const { userId } = await getSession(request)

  const { user, refreshUser } = await getUserById(Number(userId))

  return { user, refreshUser }
}
