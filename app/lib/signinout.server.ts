// import * as jose from "jose"
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
// import { getStudentDBByEmail } from "./services/student.server"
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
export async function signin({
  request,
  code,
}: {
  request: Request
  code: string
}) {
  logger.debug("🍓 signin")
  const { tokens } = await getClientFromCode(code)

  // verify token with zod
  const result = TokenSchema.safeParse(tokens)

  if (!result.success) {
    console.error(result.error.errors)
    throw redirectToSignin(request)
  }

  let { access_token, expiry_date, scope, token_type, refresh_token } =
    result.data

  // TODO: !!DEBUG!!: setting expiryDateDummy to 10 seconds
  // const expiry_date_dummy = new Date().getTime() + 1000 * 15
  // expiry_date = expiry_date_dummy

  // let refreshTokenExpiryDummy = Date.now() + 1000 * 30 // 30 seconds
  // let refreshTokenExpiry = refreshTokenExpiryDummy
  let refreshTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24) // 1 days

  logger.info(`🍓 signin: new expiry_date ${expiry_date}`)

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
    throw redirectToSignin(request, { authstate: "no-access-token" })
  }

  console.log(`🔥 getPersomFromPeople`)
  let start = performance.now()
  const person = await getPersonFromPeople(access_token)
  if (!person) {
    throw redirectToSignin(request, { authstate: "unauthorized" })
  }
  let end = performance.now()
  console.log(`🔥 getPersomFromPeople time: ${end - start} ms`)

  // check if email is valid or person is admin
  if (
    !checkValidStudentOrParentEmail(person.email) &&
    !checkValidAdminEmail(person.email)
  ) {
    throw redirectToSignin(request, { authstate: `not-parent-account` })
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

  // convert parent email to student email
  let studentEmail = person.email.replace(/^p/, "b")
  logger.debug(`🍓 signin: studentEmail ${studentEmail}`)

  // find student in prisma db with student email even if user is parent
  // const studentPrisma = await getStudentDBByEmail(studentEmail)

  const student = await getStudentByEmail(studentEmail)
  if (!student) {
    throw redirectToSignin(request, { authstate: `not-seig-account` })
  }

  console.log("🍓 signin: before transaction")
  start = performance.now()

  await prisma.$transaction([
    prisma.stats.upsert({
      where: {
        userId: userPrisma.id,
      },
      update: {},
      create: {
        userId: userPrisma.id,
      },
    }),
    prisma.credential.upsert({
      where: {
        userId: userPrisma.id,
      },
      update: {
        accessToken: access_token,
        scope: scope,
        tokenType: token_type,
        expiry: new Date(expiry_date),
        refreshToken: refresh_token,
        refreshTokenExpiry: refreshTokenExpiry,
      },
      create: {
        accessToken: access_token,
        scope: scope,
        tokenType: token_type,
        expiry: new Date(expiry_date),
        userId: userPrisma.id,
        refreshToken: refresh_token,
        refreshTokenExpiry: refreshTokenExpiry,
      },
    }),
    prisma.student.upsert({
      where: {
        gakuseki: student.gakuseki,
      },
      update: {
        users: {
          connect: {
            id: userPrisma.id,
          },
        },
      },
      create: {
        gakuseki: student.gakuseki,
        gakunen: student.gakunen,
        hr: student.hr,
        hrNo: student.hrNo,
        last: student.last,
        first: student.first,
        sei: student.sei || "",
        mei: student.mei || "",
        email: student.email,
        folderLink: student.folderLink,
        expiry: new Date(EXPIRY_DATE),
        users: {
          connect: {
            id: userPrisma.id,
          },
        },
      },
    }),
  ])
  end = performance.now()
  console.log(`✨ after transaction time: ${end - start} ms`)

  // if user passes email check, set user.activated to true
  const updatedUser = await updateUser(userPrisma.id)

  if (!updatedUser) {
    throw redirectToSignin(request, { authstate: `not-seig-account` })
  }

  // const userJWT = await updateUserJWT(
  //   userPrisma.email,
  //   new Date(expiry_date),
  //   refreshTokenExpiry,
  // )
  if (["ADMIN", "SUPER"].includes(userPrisma.role)) {
    return {
      userId: userPrisma.id,
      folderId: null,
      accessToken: access_token,
    }
  }

  if (!student.folderLink) {
    throw new Response(`no-folder`, { status: 401 })
  }
  const folderId = getFolderId(student.folderLink)

  return {
    userId: userPrisma.id,
    folderId,
    accessToken: access_token,
  }
}

// used in authenticate
// export async function updateUserJWT(
//   email: string,
//   expiry: Date,
//   refreshTokenExpiry: Date,
// ): Promise<string> {
//   logger.debug(`🍓 signin: updateUserJWT: email ${email}`)
//   const secret = process.env.SESSION_SECRET
//   const secretEncoded = new TextEncoder().encode(secret)
//   const userJWT = await new jose.SignJWT({
//     email,
//     rexp: refreshTokenExpiry.getTime(),
//   })
//     .setProtectedHeader({ alg: "HS256" })
//     .setExpirationTime(expiry)
//     .sign(secretEncoded)
//   return userJWT
// }

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
