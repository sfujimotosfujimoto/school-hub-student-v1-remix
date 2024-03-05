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
  email: string,
  accessToken: string,
  role: string,
  picture: string,
  folderId: string | null,
  redirectPath: string,
) {
  const session = await sessionStorage.getSession()
  session.set("userId", userId)
  session.set("email", email)
  session.set("accessToken", accessToken)
  session.set("role", role)
  session.set("picture", picture)
  if (folderId) session.set("folderId", folderId)
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
  email: string | null
  accessToken: string | null
  role: string | null
  picture: string | null
  folderId: string | null
}> {
  logger.debug(`👑 getSession: request ${request.url}, ${request.method}`)

  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  const userId = session.get("userId")
  const email = session.get("email")
  const accessToken = session.get("accessToken")
  const role = session.get("role")
  const picture = session.get("picture")
  const folderId = session.get("folderId")

  if (!userId || !accessToken)
    return {
      userId: null,
      email: null,
      accessToken: null,
      role: null,
      picture: null,
      folderId: null,
    }

  return {
    userId: userId,
    email,
    accessToken: accessToken,
    role,
    picture,
    folderId,
  }
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
