import * as jose from "jose"
import { z } from "zod"

import { getPersonFromPeople } from "./google/people.server"
import { getStudentByEmail } from "./google/sheets.server"
import {
  createUserSession,
  destroyUserSession,
} from "./services/session.server"
import {
  checkValidAdminEmail,
  checkValidStudentOrParentEmail,
  getFolderId,
} from "./utils"
import { getClientFromCode } from "./google/google.server"
import { redirect } from "@remix-run/node"
import { logger } from "./logger"
import { prisma } from "./db.server"
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
    throw redirect(`/auth/signin?authstate=unauthorized-001`)
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
    throw redirect(`/auth/signin?authstate=unauthorized-002`)
  }

  const person = await getPersonFromPeople(access_token)
  if (!person) {
    throw redirect(`/auth/signin?authstate=unauthorized`)
  }

  // check if email is valid or person is admin
  if (
    !checkValidStudentOrParentEmail(person.email) &&
    !checkValidAdminEmail(person.email)
  ) {
    throw redirect(`/auth/signin?authstate=not-parent-account`)
  }

  // find if user is parent or student in db
  let userPrisma = await prisma.user.findUnique({
    where: {
      email: person.email,
    },
  })

  // if no user, create in prisma db
  // this can be parent or student

  if (!userPrisma) {
    userPrisma = await prisma.user.create({
      data: {
        first: person.first,
        last: person.last,
        email: person.email,
        picture: person.picture,
        role: "USER",
      },
    })
  }

  // find stats in prisma db
  // there can be one for perent and student
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

  // find credential in prisma db
  // there can be one for perent and student
  let cred = await prisma.credential.findUnique({
    where: {
      userId: userPrisma.id,
    },
  })

  // if no credential, create in prisma db
  // use data from google endpoint
  if (!cred) {
    cred = await prisma.credential.create({
      data: {
        accessToken: access_token,
        scope: scope,
        tokenType: token_type,
        expiry: expiry_date,
        userId: userPrisma.id,
        refreshToken: refresh_token,
        refreshTokenExpiry: refreshTokenExpiry,
      },
    })
  } else {
    // else update credential in prisma db
    cred = await prisma.credential.update({
      where: {
        userId: userPrisma.id,
      },
      data: {
        accessToken: access_token,
        scope: scope,
        tokenType: token_type,
        expiry: expiry_date,
        refreshToken: refresh_token,
        refreshTokenExpiry: refreshTokenExpiry,
      },
    })
  }

  // convert parent email to student email
  let studentEmail = person.email.replace(/^p/, "b")
  logger.debug(`✅ studentEmail ${studentEmail}`)

  // find student in prisma db with student email even if user is parent
  const studentPrisma = await prisma.student.findUnique({
    where: {
      email: studentEmail,
    },
    include: {
      users: true,
    },
  })

  // if no student in db, create in prisma db
  if (!studentPrisma) {
    const student = await getStudentByEmail(studentEmail)
    logger.debug(`✅ in !studentPrisma`)
    if (student) {
      await prisma.student.create({
        data: {
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
          expiry: EXPIRY_DATE,
          users: {
            connect: {
              id: userPrisma.id,
            },
          },
        },
      })
    }
  } else {
    logger.debug(`✅ in else studentPrisma`)
    // if there is student in db, and user's id is not in student.users,
    // create student abd relation to user
    const userIds = studentPrisma.users.map((u) => u.id)
    if (!userIds.includes(userPrisma.id) && userPrisma.studentGakuseki) {
      await prisma.student.update({
        where: {
          gakuseki: userPrisma.studentGakuseki,
        },
        data: {
          users: {
            connect: {
              id: userPrisma.id,
            },
          },
        },
      })
    }
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
    throw redirect(`/auth/signin?authstate=not-seig-account`)
  }

  const userJWT = await updateUserJWT(
    userPrisma.email,
    expiry_date,
    refreshTokenExpiry,
  )
  if (["ADMIN", "SUPER"].includes(userPrisma.role)) {
    return createUserSession(userJWT, `/admin`)
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
    `✅ newUser ${JSON.stringify(newUser?.student?.folderLink, null, 2)}`,
  )

  if (!newUser?.student?.folderLink) {
    // throw redirect(`/?authstate=no-folder`)
    throw new Response(`no-folder`, { status: 401 })
  }
  const folderId = getFolderId(newUser?.student?.folderLink)

  return createUserSession(userJWT, `/student2/${folderId}`)
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
  const student = await getStudentByEmail(email)

  if (!student?.folderLink) {
    // throw redirect(`/?authstate=no-folder`)
    throw Error(`no-folder`)
  }

  const folderId = getFolderId(student?.folderLink)

  return folderId
}
