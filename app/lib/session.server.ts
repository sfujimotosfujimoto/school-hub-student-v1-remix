import * as jose from "jose"
import invariant from "tiny-invariant"
import type { UserBase } from "~/types"

import { createCookieSessionStorage, redirect } from "@remix-run/node"

import { getUserInfo } from "./user.server"

const SESSION_SECRET = process.env.SESSION_SECRET
if (!SESSION_SECRET) throw Error("session secret is not set")

// creates SessionStorage Instance -------------------------
const sessionStorage = createCookieSessionStorage({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    maxAge: 24 * 60 * 60,
    httpOnly: true,
  },
})

// Sets session called "userToken"  -------------------------
// used in [`signin.server.ts`]
export async function createUserSession(
  userToken: string,
  redirectPath: string
) {
  const session = await sessionStorage.getSession()
  session.set("userToken", userToken)
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

// Gets UserBase from Session -------------------------
// used in [`root.tsx`, `user.server.ts`]
export async function getUserBaseFromSession(
  request: Request
): Promise<UserBase | null> {
  const userToken = await getUserTokenFromSession(request)

  if (!userToken) return null

  const payload = getPayloadFromUserToken(userToken)

  // get UserBase from Prisma
  const user = await getUserInfo(payload.email)

  // if no user, create in prisma db
  invariant(user, "Could not find user")

  return user
}

// Checks if Session has User -------------------------
// used in loaders of
// ["student.tsx", "student.$studentFolderId.tsx",
// "student.$studentFolderId.$fileId.tsx"]
export async function requireUserSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  const userToken = session.get("userToken") as string | null | undefined

  if (!userToken) {
    throw redirect("/?login=false")
  }
  return userToken
}

//-------------------------------------------
// LOCAL FUNCTIONS
//-------------------------------------------
// Gets session in Request Headers -------------------------
// then gets "userToken"
// Also check if token is expired
export async function getUserTokenFromSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  const userToken = session.get("userToken") as string | null | undefined

  if (!userToken) {
    return null
  }

  return userToken
}

function getPayloadFromUserToken(userToken: string) {
  const payload = jose.decodeJwt(userToken) as { email: string; exp: number }

  if (isExpired(payload.exp)) {
    throw redirect("/?expired=true")
  }
  return payload
}

function isExpired(expire: number): boolean {
  if (expire < 10_000_000_000 && expire > 0)
    throw Error(`expire is incorrect: ${expire}`)

  const now = Date.now()

  // console.log(
  //   "🚀 lib/session.server.ts ~ 	🌈 expire ✨ ",
  //   new Date(expire).toTimeString(),
  //   new Date(Date.now()).toTimeString()
  // )

  // check for expired!!
  if (expire < now) {
    console.log("🚀 lib/session.server.ts ~ 	🌈 Expired! ✨ ")
    return true
  } else {
    return false
  }
}

// export async function requireUserWithExpiry(request: Request) {
//   const user = await getUserWithCredential(request)

//   if (!user) {
//     throw redirect("/?login=false")
//   }

//   if (isExpired(Number(user.Credential.expiryDate))) {
//     throw redirect("/?expired=true")
//   }

//   return user
// }
