import * as jose from "jose"

import { createCookieSessionStorage, redirect } from "@remix-run/node"
import type { Payload, User } from "~/types"
import { logger } from "../logger"
import { getRefreshUserById, getUserById } from "./user.server"
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
): Promise<{ user: User | null; refreshUser: User | null }> {
  logger.debug(
    `👑 getUserFromSession: request ${request.url}, ${request.method}`,
  )

  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  const userId = session.get("userId")
  if (!userId) return { user: null, refreshUser: null }

  const { user, refreshUser } = await getUserById(userId)

  if (user) {
    logger.debug(
      `👑 getUserFromSession: exp ${toLocaleString(
        user.credential?.expiry || "",
      )} -- request.url ${request.url}`,
    )
    return { user, refreshUser: null }
  } else if (!user && refreshUser) {
    logger.debug(
      `👑 getUserFromSession: !user && refreshUser: rexp ${toLocaleString(
        refreshUser.credential?.refreshTokenExpiry || "",
      )} -- request.url ${request.url}`,
    )
    return { user: null, refreshUser }
  } else {
    return { user: null, refreshUser: null }
  }
}

export async function getRefreshUserFromSession(
  request: Request,
): Promise<User | null> {
  logger.debug(
    `👑 getRefreshUserFromSession: request ${request.url}, ${request.method}`,
  )
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  const userId = session.get("userId")
  if (!userId) {
    return null
  }
  // const userJWT = await getUserJWTFromSession(request)

  // if (!userJWT) return null

  // const payload = await parseVerifyUserJWT(userJWT)

  // if (!payload) return null

  // get UserBase from Prisma
  const user = await getRefreshUserById(userId)
  // if no user, create in prisma db
  if (!user) {
    return null
  }

  logger.debug(
    `👑 getRefreshUserFromSession: rexp ${toLocaleString(
      user?.credential?.refreshTokenExpiry || 0,
    )} -- requrest.url ${request.url}`,
  )

  return user
}

export async function updateSession(
  key: string,
  value: string,
  headers = new Headers(),
) {
  logger.debug("✅ updateSession")
  try {
    // update the session with the new values
    const session = await sessionStorage.getSession()
    session.set(key, value)
    // commit the session and append the Set-Cookie header
    headers.append("Set-Cookie", await sessionStorage.commitSession(session))
    return headers
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error("Error updating session")
  }
}

//-------------------------------------------
// LOCAL FUNCTIONS
//-------------------------------------------
// Gets session in Request Headers -------------------------
// then gets "userId"
// Also check if token is expired
export async function getUserWTFromSession(
  request: Request,
): Promise<string | null> {
  logger.debug("👑 getUserJWTFromSession")
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  const userJWT = session.get("userJWT") as string | null | undefined

  if (!userJWT) {
    return null
  }

  return userJWT
}
export async function getUserJWTFromSession(
  request: Request,
): Promise<string | null> {
  logger.debug("👑 getUserJWTFromSession")
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  const userJWT = session.get("userJWT") as string | null | undefined

  if (!userJWT) {
    return null
  }

  return userJWT
}

export async function parseVerifyUserJWT(
  userJWT: string,
): Promise<Payload | null> {
  logger.debug("✨ parseVerifyUserJWT")

  // decode the JWT and get payload<email,exp>
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET)
  // console.log("✅ parseVerifyUserJWT: secret", secret)
  const { payload } = await jose.jwtVerify(userJWT, secret)
  // console.log("✅ parseVerifyUserJWT: payload", payload)
  // const payload = jose.decodeJwt(userJWT) as { email: string; exp: number }
  if (payload.email === undefined || payload.exp === undefined) return null

  const typedPayload = payload as Payload
  return typedPayload
}

// // Gets payload<email, exp> from "userJWT"
// async function verifyUserTokenJWT(userToken: string) {
//   // decode the JWT and get payload<email,exp>
//   const secret = new TextEncoder().encode(process.env.SESSION_SECRET)
//   const { payload } = await jose.jwtVerify(userToken, secret)
//   // const payload = jose.decodeJwt(userToken) as { email: string; exp: number }
//   if (payload.email === undefined || payload.exp === undefined) return null

//   const typedPayload = payload as { email: string; exp: number }
//   // check if expired
//   if (isExpired(typedPayload.exp)) {
//     return null
//   }

//   return typedPayload
// }

// // Check expiration
// function isExpired(expire: number): boolean {
//   if (expire < 10_000_000_000 && expire > 0)
//     throw Error(`expire is incorrect: ${expire}`)

//   const now = Date.now()

//   // check for expired!!
//   if (expire < now) {
//     return true
//   } else {
//     return false
//   }
// }

// export async function getUserId(request: Request) {
//   const authSession = await sessionStorage.getSession(
//     request.headers.get("cookie"),
//   )

//   const session = await prisma.session.findUnique({
//     select: { user: { select: { id: true } } },
//     where: { id: sessionId, expirationDate: { gt: new Date() } },
//   })
//   if (!session?.user) {
//     redirectToSignin("/", {
//       headers: {
//         "set-cookie": await authSessionStorage.destroySession(authSession),
//       },
//     })
//   }
//   return session.user.id
// }

// Checks if Session has User -------------------------
// used in loaders of
// ["student.tsx", "student.$studentFolderId.tsx",
// "student.$studentFolderId.$fileId.tsx"]
// export async function requireUserSession(request: Request) {
//   const session = await sessionStorage.getSession(request.headers.get("Cookie"))

//   const userJWT= session.get("userJWT") as string | null | undefined

//   if (!userJWT) {
//     redirectToSignin("/auth/signin?authstate=unauthorized")
//   }

//   // get payload<email, exp>
//   const payload = await verifyUserTokenJWT(userJWT)
//   if (!payload) redirectToSignin("/auth/signin?authstate=expired")

//   if (!payload || isExpired(payload.exp)) {
//     redirectToSignin("/auth/signin?expired=true")
//   }

//   return payload
// }
