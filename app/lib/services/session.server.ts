import * as jose from "jose"
import type { Payload, User } from "~/types"

import { createCookieSessionStorage, redirect } from "@remix-run/node"
import { logger } from "../logger"
import { getRefreshUserByEmail, getUserByEmail } from "./user.server"
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

// Sets session called "userJWT"  -------------------------
// used in [`signin.server.ts`]
export async function createUserSession(userJWT: string, redirectPath: string) {
  const session = await sessionStorage.getSession()
  session.set("userJWT", userJWT)
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

export async function getUserFromSession(
  request: Request,
): Promise<User | null> {
  logger.debug(
    `👑 getUserFromSession: request ${request.url}, ${request.method}`,
  )
  const userJWT = await getUserJWTFromSession(request)

  if (!userJWT) return null

  const payload = await parseVerifyUserJWT(userJWT)

  if (!payload) return null

  // get UserBase from Prisma
  const user = await getUserByEmail(payload.email)
  // if no user, create in prisma db

  logger.debug(
    `👑 getUserFromSession: exp ${new Date(payload.exp).toLocaleString(
      "ja-JP",
      { timeZone: "Asia/Tokyo" },
    )} -- requrest.url ${request.url}`,
  )

  if (!user) {
    return null
  }

  return user
}

export async function getRefreshUserFromSession(
  request: Request,
): Promise<User | null> {
  logger.debug(
    `👑 getRefreshUserFromSession: request ${request.url}, ${request.method}`,
  )
  const userJWT = await getUserJWTFromSession(request)

  if (!userJWT) return null

  const payload = await parseVerifyUserJWT(userJWT)

  if (!payload) return null

  // get UserBase from Prisma
  const user = await getRefreshUserByEmail(payload.email)
  // if no user, create in prisma db

  logger.debug(
    `👑 getRefreshUserFromSession: rexp ${new Date(
      user?.credential?.refreshTokenExpiry || "",
    ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} -- requrest.url ${
      request.url
    }`,
  )

  if (!user) {
    return null
  }

  return user
}

//-------------------------------------------
// LOCAL FUNCTIONS
//-------------------------------------------
// Gets session in Request Headers -------------------------
// then gets "userJWT"
// Also check if token is expired
export async function getUserJWTFromSession(request: Request) {
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
  // decode the JWT and get payload<email,exp>
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET)
  const { payload } = await jose.jwtVerify(userJWT, secret)
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
//     throw redirect("/", {
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
//     throw redirect("/auth/signin?authstate=unauthorized")
//   }

//   // get payload<email, exp>
//   const payload = await verifyUserTokenJWT(userJWT)
//   if (!payload) throw redirect("/auth/signin?authstate=expired")

//   if (!payload || isExpired(payload.exp)) {
//     throw redirect("/auth/signin?expired=true")
//   }

//   return payload
// }
