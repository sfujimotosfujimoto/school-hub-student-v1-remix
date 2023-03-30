import { google } from "googleapis"
import * as jose from "jose"
import invariant from "tiny-invariant"
import type { IdToken, Tokens, User } from "~/types"

import { createCookieSessionStorage, redirect } from "@remix-run/node"

import { prisma } from "./database.server"

const SESSION_SECRET = process.env.SESSION_SECRET

if (!SESSION_SECRET) throw Error("session secret is not set")

const sessionStorage = createCookieSessionStorage({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    maxAge: 24 * 60 * 60,
    httpOnly: true,
  },
})

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

export async function getUserTokenFromSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  const userToken = session.get("userToken") as string | null | undefined

  if (!userToken) {
    return null
  }

  return userToken
}

export async function destroyUserSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  })
}

export async function requireUserSession(request: Request) {
  const userToken = await getUserTokenFromSession(request)

  if (!userToken) {
    throw redirect("/")
  }

  return userToken
}

export async function getEmailFromSession(request: Request) {
  const userToken = await getUserTokenFromSession(request)

  invariant(userToken, "no user token jwt")

  const payload = jose.decodeJwt(userToken) as { email: string }
  return payload.email
}

export async function getUserFromSession(
  request: Request
): Promise<User | null> {
  const userToken = await getUserTokenFromSession(request)

  if (!userToken) return null

  const payload = jose.decodeJwt(userToken) as { email: string }

  const user = await getUserInfo(payload.email)

  // if no user, create in prisma db
  invariant(user, "Could not find user")

  return user
}

export async function getUserInfo(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      first: true,
      last: true,

      email: true,
      Credential: {
        select: {
          accessToken: true,
          idToken: true,
          expiryDate: true,
        },
      },
    },
  })

  if (!user || !user.Credential) {
    return null
  }

  const idToken = jose.decodeJwt(user.Credential.idToken) as IdToken

  return {
    last: idToken.family_name,
    first: idToken.given_name,
    email: idToken.email,
    picture: idToken.picture,
    exp: idToken.exp,
  }
}

export async function signin({ code }: { code: string }) {
  // creates oauth2Client from client_id and client_secret
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_API_CLIENT_ID,
    process.env.GOOGLE_API_CLIENT_SECRET,
    process.env.GOOGLE_API_REDIRECT_URI
  )

  // get token from OAuth client
  const output = await oauth2Client.getToken(code)

  const tokens = output.tokens as Tokens
  if (!tokens.id_token) {
    return redirect("/")
  }

  const idToken = jose.decodeJwt(tokens.id_token) as IdToken

  let user = await prisma.user.findUnique({
    where: {
      email: idToken.email,
    },
  })

  // if no user, create in prisma db
  if (!user) {
    user = await prisma.user.create({
      data: {
        first: idToken.given_name,
        last: idToken.family_name,
        email: idToken.email,
      },
    })
  }

  let cred = await prisma.credential.findUnique({
    where: {
      userId: user.id,
    },
  })

  if (!cred) {
    // add credentials to cockroach db
    cred = await prisma.credential.create({
      data: {
        accessToken: tokens.access_token,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        expiryDate: tokens.expiry_date,
        idToken: JSON.stringify(tokens.id_token),
        userId: user.id,
      },
    })
  } else {
    cred = await prisma.credential.update({
      where: {
        userId: user.id,
      },
      data: {
        accessToken: tokens.access_token,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        expiryDate: tokens.expiry_date,
        idToken: JSON.stringify(tokens.id_token),
      },
    })
  }

  const secret = process.env.SESSION_SECRET

  if (!secret) {
    return redirect("/")
  }

  const secretEncoded = new TextEncoder().encode(secret)

  const token = await new jose.SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secretEncoded)

  return createUserSession(token, "/student")
}

// export async function signup({
//   email,
//   password,
// }: {
//   email: string
//   password: string
// }) {
//   const existingUser = await prisma.user.findFirst({ where: { email } })

//   if (existingUser) {
//     const error = new Error(
//       "A user with the provided email address already exists."
//     )

//     // @ts-ignore
//     error.status = 422
//     throw error
//   }

//   const passwordHash = await hash(password, 12)

//   const user = await prisma.user.create({
//     data: { email, password: passwordHash },
//   })
//   return createUserSession(user.id, "/expenses")
// }

// export async function login({
//   email,
//   password,
// }: {
//   email: string
//   password: string
// }) {
//   const existingUser = await prisma.user.findFirst({ where: { email } })

//   if (!existingUser) {
//     const error = new Error(
//       "Could not log you in, please check the provided credentials."
//     )

//     // @ts-ignore
//     error.status = 401
//     throw error
//   }

//   const passwordCorrect = await compare(password, existingUser.password)

//   if (!passwordCorrect) {
//     const error = new Error(
//       "Could not log you in, please check the provided credentials."
//     )

//     // @ts-ignore
//     error.status = 401
//     throw error
//   }

//   return createUserSession(existingUser.id, "/expenses")
// }
