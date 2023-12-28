import * as jose from "jose"
import { z } from "zod"

import { getPersonFromPeople } from "./google/people.server"
import { getStudentByEmail } from "./google/sheets.server"
import { destroyUserSession } from "./services/session.server"
import {
  checkValidAdminEmail,
  checkValidStudentOrParentEmail,
  getFolderId,
} from "./utils"
import { getClientFromCode } from "./google/google.server"
import { logger } from "./logger"
import { prisma } from "./db.server"
import {
  createStudentDB,
  getStudentDBByEmail,
  updateStudentDB,
} from "./services/student.server"
import { updateUser } from "./services/user.server"
import { redirectToSignin } from "./responses"
const EXPIRY_DATE = new Date("2024-03-30").getTime()
const SESSION_SECRET = process.env.SESSION_SECRET
if (!SESSION_SECRET) throw Error("session secret is not set")

const TokenSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  scope: z.string(),
  expiry_date: z.number(),
  refresh_token: z.string().optional(),
  id_token: z.string(),
})

/**
 * signin
 */
export async function signin({ code }: { code: string }) {
  logger.debug("🍓 signin")
  const { tokens } = await getClientFromCode(code)

  // verify token with zod
  const result = TokenSchema.safeParse(tokens)

  if (!result.success) {
    console.error(result.error.errors)
    throw redirectToSignin()
  }

  let { access_token, expiry_date, scope, token_type, refresh_token } =
    result.data

  // TODO: !!DEBUG!!: setting expiryDateDummy to 10 seconds
  const expiryDummy = new Date().getTime() + 1000 * 15
  expiry_date = expiryDummy

  // let refreshTokenExpiryDummy = Date.now() + 1000 * 30 // 30 seconds
  // let refreshTokenExpiry = refreshTokenExpiryDummy
  let refreshTokenExpiry = Date.now() + 1000 * 60 * 60 * 24 * 14 // 14 days

  logger.info(
    `🍓 signin: new expiry_date ${new Date(expiry_date || 0).toLocaleString(
      "ja-JP",
      { timeZone: "Asia/Tokyo" },
    )}`,
  )

  logger.info(
    `🍓 signin: new refreshTokenExpiry ${new Date(
      refreshTokenExpiry || 0,
    ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
  )

  if (!access_token) {
    throw redirectToSignin(`authstate=unauthorized-002`)
  }

  const person = await getPersonFromPeople(access_token)
  if (!person) {
    throw redirectToSignin(`authstate=unauthorized`)
  }

  // check if email is valid or person is admin
  if (
    !checkValidStudentOrParentEmail(person.email) &&
    !checkValidAdminEmail(person.email)
  ) {
    throw redirectToSignin(`authstate=not-parent-account`)
  }

  let userPrisma = await prisma.user.upsert({
    where: {
      email: person.email,
    },
    update: {},
    create: {
      first: person.first,
      last: person.last,
      email: person.email,
      picture: person.picture,
      role: "USER",
    },
  })

  await prisma.stats.upsert({
    where: {
      userId: userPrisma.id,
    },
    update: {},
    create: {
      userId: userPrisma.id,
    },
  })

  await prisma.credential.upsert({
    where: {
      userId: userPrisma.id,
    },
    update: {
      accessToken: access_token,
      scope: scope,
      tokenType: token_type,
      expiry: expiry_date,
      refreshToken: refresh_token,
      refreshTokenExpiry: refreshTokenExpiry,
    },
    create: {
      accessToken: access_token,
      scope: scope,
      tokenType: token_type,
      expiry: expiry_date,
      userId: userPrisma.id,
      refreshToken: refresh_token,
      refreshTokenExpiry: refreshTokenExpiry,
    },
  })

  // convert parent email to student email
  let studentEmail = person.email.replace(/^p/, "b")
  logger.debug(`🍓 signin: studentEmail ${studentEmail}`)

  // find student in prisma db with student email even if user is parent
  const studentPrisma = await getStudentDBByEmail(studentEmail)
  console.log("🍓 signin: studentPrisma", studentPrisma)

  // if no student in db, create in prisma db
  if (!studentPrisma || studentPrisma.users.length === 0) {
    console.log(
      "🍓 signin:in !studentPrisma || studentPrisma.users.length === 0",
    )
    const student = await getStudentByEmail(studentEmail)
    logger.debug(`🍓 signin:in !studentPrisma`)

    if (student) {
      console.log("🍓 signin: in student")
      await createStudentDB(student, userPrisma.id, EXPIRY_DATE)
    }
  } else {
    logger.debug(`🍓 signin: in else studentPrisma`)
    // if there is student in db, and user's id is not in student.users,
    // create student abd relation to user
    const userIds = studentPrisma.users.map((u) => u.id)
    console.log(
      "🍓 signin: userIds",
      userIds,
      "userPrisma.id",
      userPrisma.id,
      "studentPrisma.gakuseki",
      studentPrisma.gakuseki,
    )
    if (!userIds.includes(userPrisma.id)) {
      console.log(
        "🍓 signin: in !userIds.includes(userPrisma.id) && userPrisma.studentGakuseki",
      )
      await updateStudentDB(userPrisma.id, studentPrisma.gakuseki)
    }
  }

  // if user passes email check, set user.activated to true
  const updatedUser = await updateUser(userPrisma.id)

  if (!updatedUser) {
    throw redirectToSignin(`authstate=not-seig-account`)
  }

  const userJWT = await updateUserJWT(
    userPrisma.email,
    expiry_date,
    refreshTokenExpiry,
  )
  if (["ADMIN", "SUPER"].includes(userPrisma.role)) {
    return {
      userId: userPrisma.id,
      folderId: null,
      userJWT,
      accessToken: access_token,
    }
    // return createUserSession(userJWT, `/admin`)
  }

  const newUser = await prisma.user.findUnique({
    where: {
      email: userPrisma.email,
    },
    include: {
      student: true,
    },
  })

  logger.debug(
    `🍓 signin: newUser ${JSON.stringify(
      newUser?.student?.folderLink,
      null,
      2,
    )}`,
  )

  if (!newUser?.student?.folderLink) {
    throw new Response(`no-folder`, { status: 401 })
  }
  const folderId = getFolderId(newUser?.student?.folderLink)

  return {
    folderId,
    userJWT,
    accessToken: access_token,
    userId: newUser?.id,
  }
}

// used in authenticate
export async function updateUserJWT(
  email: string,
  expiry: number,
  refreshTokenExpiry: number,
): Promise<string> {
  logger.debug(`🍓 signin: updateUserJWT: email ${email}`)
  const secret = process.env.SESSION_SECRET
  const secretEncoded = new TextEncoder().encode(secret)
  const userJWT = await new jose.SignJWT({ email, rexp: refreshTokenExpiry })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiry)
    .sign(secretEncoded)
  return userJWT
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
  email: string,
): Promise<string | null> {
  console.log("✅ getFolderIdFromEmail", email)
  const student = await getStudentByEmail(email)

  if (!student?.folderLink) {
    throw Error(`no-folder`)
  }

  const folderId = getFolderId(student?.folderLink)

  return folderId
}
