import { google } from "googleapis"
import * as jose from "jose"
import type { Tokens } from "~/types"

import { prisma } from "./db.server"
import { getUserInfoFromPeople } from "./google.server"
import { createUserSession } from "./session.server"
import { errorResponse } from "./utils.server"

const SESSION_SECRET = process.env.SESSION_SECRET
if (!SESSION_SECRET) throw Error("session secret is not set")

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
  if (!tokens.access_token) {
    throw errorResponse(
      "You are not authorized. Get permission from admin s-fujimoto@seig-boys.jp.",
      401
    )
  }

  const userInfo = await getUserInfoFromPeople(tokens.access_token)

  if (!userInfo) {
    throw errorResponse(
      "You are not authorized. Get permission from admin s-fujimoto@seig-boys.jp.",
      401
    )
  }

  let user = await prisma.user.findUnique({
    where: {
      email: userInfo.email,
    },
  })

  // if no user, create in prisma db
  if (!user) {
    user = await prisma.user.create({
      data: {
        first: userInfo.givenName,
        last: userInfo.familyName,
        email: userInfo.email,
        picture: userInfo.pictureUrl,
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
      },
    })
  }

  // TODO: delete me
  console.log('🚀 data/signin.server.ts ~ 	🌈 access_token ✨ ', tokens.access_token)

  const secret = process.env.SESSION_SECRET

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
