import { createCookieSessionStorage, redirect } from "@remix-run/node"
import type { User } from "~/types"
import { logger } from "../logger"
import { getUserById } from "./user.server"
import { toLocaleString } from "../utils"
const SESSION_SECRET = process.env.SESSION_SECRET
if (!SESSION_SECRET) throw Error("session secret is not set")

const SESSION_MAX_AGE = 60 * 60 * 24 * 14 // 14 days

// creates SessionStorage Instance -------------------------
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [SESSION_SECRET],
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  },
})

// Sets session called "userId"  -------------------------
// used in [`signin.server.ts`]
export async function createUserSession(userId: number, redirectPath: string) {
  const session = await sessionStorage.getSession()
  session.set("userId", userId)
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
 * Get User From Session
 */
export async function getUserFromSession(
  request: Request,
): Promise<{ user: User | null }> {
  logger.debug(
    `👑 getUserFromSession: request ${request.url}, ${request.method}`,
  )

  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  const userId = session.get("userId")
  if (!userId) {
    logger.debug(
      `👑 getUserFromSession: no userId in session -- request.url ${request.url}`,
    )
    return { user: null }
  }

  const { user } = await getUserById(userId)

  if (!user) {
    logger.debug(
      `👑 getUserFromSession: no user in DB -- request.url ${request.url}`,
    )
    return { user: null }
  }

  logger.debug(
    `👑 getUserFromSession: exp ${toLocaleString(
      user.credential?.expiry || "",
    )} -- request.url ${request.url}`,
  )

  logger.info(
    `👑 getUserFromSession: ${user.last}${user.first}, ${user.id} ${request.url}`,
  )
  return { user }
}
