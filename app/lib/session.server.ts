import * as jose from "jose"
import invariant from "tiny-invariant"
import type { User } from "~/types"

import { createCookieSessionStorage, redirect } from "@remix-run/node"
import * as userS from "./user.server"

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

export async function getUserFromSession(
  request: Request
): Promise<User | null> {
  const userToken = await getUserTokenFromSession(request)

  if (!userToken) return null

  const payload = await verifyUserTokenJWT(userToken)

  if (!payload) return null
  // get UserBase from Prisma
  const user = await userS.getUserByEmail(payload.email)
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
    throw redirect("/?authstate=unauthorized")
  }

  // get payload<email, exp>
  const payload = await verifyUserTokenJWT(userToken)
  if (!payload) throw redirect("/?authstate=expired")

  if (!payload || isExpired(payload.exp)) {
    throw redirect("/?expired=true")
  }

  return payload
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

// Gets payload<email, exp> from "userToken"
async function verifyUserTokenJWT(userToken: string) {
  // decode the JWT and get payload<email,exp>
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET)
  const { payload } = await jose.jwtVerify(userToken, secret)
  // const payload = jose.decodeJwt(userToken) as { email: string; exp: number }
  if (payload.email === undefined || payload.exp === undefined) return null

  const typedPayload = payload as { email: string; exp: number }
  // check if expired
  if (isExpired(typedPayload.exp)) {
    return null
  }

  return typedPayload
}

// Check expiration
function isExpired(expire: number): boolean {
  if (expire < 10_000_000_000 && expire > 0)
    throw Error(`expire is incorrect: ${expire}`)

  const now = Date.now()

  // check for expired!!
  if (expire < now) {
    return true
  } else {
    return false
  }
}
