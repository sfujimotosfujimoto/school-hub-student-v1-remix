import * as jose from "jose"
import type { Tokens } from "~/types"

import { prisma } from "./db.server"
import { getPersonFromPeople } from "./google/people.server"
import { getStudentDatumByEmail } from "./google/sheets.server"
import { createUserSession, destroyUserSession } from "./session.server"
import {
  checkValidAdminEmail,
  checkValidStudentOrParentEmail,
  getFolderId,
} from "./utils"
import { initializeClient } from "./google/google.server"
import { redirect } from "@remix-run/node"

const SESSION_SECRET = process.env.SESSION_SECRET
if (!SESSION_SECRET) throw Error("session secret is not set")

/**
 * signin
 */
export async function signin({ code }: { code: string }) {
  // creates oauth2Client from client_id and client_secret
  const oauth2Client = initializeClient()
  oauth2Client.generateAuthUrl({ prompt: "select_account" })

  // get token from OAuth client
  const output = await oauth2Client.getToken(code)

  const tokens = output.tokens as Tokens
  if (!tokens.access_token) {
    throw redirect(`/?authstate=unauthorized`)
  }

  const person = await getPersonFromPeople(tokens.access_token)
  if (!person) {
    throw redirect(`/?authstate=unauthorized`)
  }

  // check if email is valid or person is admin
  if (
    !checkValidStudentOrParentEmail(person.email) &&
    !checkValidAdminEmail(person.email)
  ) {
    throw redirect(`/?authstate=not-parent-account`)
  }

  let userPrisma = await prisma.user.findUnique({
    where: {
      email: person.email,
    },
  })

  // if no user, create in prisma db
  if (!userPrisma) {
    userPrisma = await prisma.user.create({
      data: {
        first: person.first,
        last: person.last,
        email: person.email,
        picture: person.picture,
      },
    })
  }

  // check if user has stats in prisma db
  let stats = await prisma.stats.findUnique({
    where: {
      userId: userPrisma.id,
    },
  })

  // if no stats, create in prisma db
  if (!stats) {
    stats = await prisma.stats.create({
      data: {
        userId: userPrisma.id,
      },
    })
  }

  let cred = await prisma.credential.findUnique({
    where: {
      userId: userPrisma.id,
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
        userId: userPrisma.id,
      },
    })
  } else {
    cred = await prisma.credential.update({
      where: {
        userId: userPrisma.id,
      },
      data: {
        accessToken: tokens.access_token,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        expiryDate: tokens.expiry_date,
      },
    })
  }

  // if user passes email check, set user.activated to true
  const updatedUser = await prisma.user.update({
    where: {
      id: userPrisma.id,
    },
    data: {
      activated: true,
      stats: {
        update: {
          count: {
            increment: 1,
          },
          lastVisited: new Date(),
        },
      },
    },
  })

  if (!updatedUser) {
    throw redirect(`/?authstate=not-seig-account`)
  }

  const secret = process.env.SESSION_SECRET
  const secretEncoded = new TextEncoder().encode(secret)
  const token = await new jose.SignJWT({ email: userPrisma.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(tokens.expiry_date)
    .sign(secretEncoded)

  if (userPrisma.role === "ADMIN") {
    return createUserSession(token, `/admin`)
  }

  const folderId = await getFolderIdFromEmail(userPrisma.email)

  return createUserSession(token, `/student/${folderId}`)
}

/**
 * signout
 */
export async function signout({ request }: { request: Request }) {
  return destroyUserSession(request)
}

/**
 * Gets folderId from email
 *
 * @export
 * @param {string} email
 * @return {*}  {(Promise<{
 * 	folderId: string | null
 * }>)}
 */
export async function getFolderIdFromEmail(
  email: string
): Promise<string | null> {
  const student = await getStudentDatumByEmail(email)

  if (!student?.folderLink) {
    throw redirect(`/?authstate=no-folder`)
  }

  const folderId = getFolderId(student?.folderLink)

  return folderId
}
