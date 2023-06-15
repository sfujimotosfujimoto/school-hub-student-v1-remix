import { google } from "googleapis"
import * as jose from "jose"
import type { Tokens } from "~/types"

import { prisma } from "./db.server"
import { getUserInfoFromPeople } from "./google/people.server"
import { getStudentDataByEmail } from "./google/sheets.server"
import { createUserSession, destroyUserSession } from "./session.server"
import { getFolderId } from "./utils"
import { errorResponse } from "./utils.server"

const SESSION_SECRET = process.env.SESSION_SECRET
if (!SESSION_SECRET) throw Error("session secret is not set")

/**
 * signin
 */
export async function signin({ code }: { code: string }) {
  // creates oauth2Client from client_id and client_secret
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_API_CLIENT_ID,
    process.env.GOOGLE_API_CLIENT_SECRET,
    process.env.GOOGLE_API_REDIRECT_URI
  )

  // get token from OAuth client
  const output = await oauth2Client.getToken(code)
  oauth2Client.generateAuthUrl({ prompt: "select_account" })

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
        first: userInfo.first,
        last: userInfo.last,
        email: userInfo.email,
        picture: userInfo.picture,
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
  // get StudentData from json
  const student = await getStudentDataByEmail(user.email)

  // if no folderLink
  if (!student?.folderLink)
    throw errorResponse("You must use a parent account.", 403)

  const folderId = getFolderId(student?.folderLink)

  const secret = process.env.SESSION_SECRET

  const secretEncoded = new TextEncoder().encode(secret)

  const token = await new jose.SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(tokens.expiry_date)
    .sign(secretEncoded)

  return createUserSession(token, `/${folderId}`)
}

/**
 * signout
 */
export async function signout({ request }: { request: Request }) {
  return destroyUserSession(request)
}
