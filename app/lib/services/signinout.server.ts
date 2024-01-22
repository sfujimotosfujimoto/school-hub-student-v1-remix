// import * as jose from "jose"
import { z } from "zod"

import { getPersonFromPeople } from "../google/people.server"
import { getStudentByEmail } from "../google/sheets.server"
import { destroyUserSession } from "./session.server"
import {
  checkValidAdminEmail,
  checkValidStudentOrParentEmail,
  getFolderId,
} from "../utils"
import { getClientFromCode } from "../google/google.server"
import { logger } from "../logger"
import { prisma } from "./db.server"
// import { getStudentDBByEmail } from "./services/student.server"
// import { updateUser } from "./services/user.server"
import { errorResponses } from "../error-responses"
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

  logger.debug(`💥 start: getClientFromCode`)
  let start1 = performance.now()
  const { tokens } = await getClientFromCode(code)
  let end1 = performance.now()
  logger.debug(
    `🔥   end: getClientFromCode \t\ttime: ${(end1 - start1).toFixed(2)} ms`,
  )

  // verify token with zod
  const result = TokenSchema.safeParse(tokens)

  if (!result.success) {
    console.error(result.error.errors)
    throw errorResponses.unauthorized()
    // throw redirectToSignin(request)
  }

  let { access_token, expiry_date, scope, token_type, refresh_token } =
    result.data

  // TODO: !!DEBUG!!: setting expiryDateDummy to 10 seconds
  // const expiry_date_dummy = new Date().getTime() + 1000 * 15
  // expiry_date = expiry_date_dummy

  // let refreshTokenExpiryDummy = Date.now() + 1000 * 30 // 30 seconds
  // let refreshTokenExpiry = refreshTokenExpiryDummy
  let refreshTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) // 14 days

  if (!access_token) {
    throw errorResponses.unauthorized()
    // throw redirectToSignin(request, { authstate: "no-access-token" })
  }

  logger.debug(`💥 start: getPersonFromPeople`)
  let start2 = performance.now()
  const person = await getPersonFromPeople(access_token)
  let end2 = performance.now()
  logger.debug(
    `🔥   end: getPersonFromPeople \t\ttime: ${(end2 - start2).toFixed(2)} ms`,
  )
  if (!person) {
    throw errorResponses.unauthorized()
    // throw redirectToSignin(request, { authstate: "unauthorized" })
  }

  logger.info(
    `🍓 signin: new expiry_date ${person.last} ${person.first} - ${new Date(
      expiry_date || 0,
    ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
  )

  logger.info(
    `🍓 signin: new refreshTokenExpiry ${person.last} ${person.first} - ${new Date(
      refreshTokenExpiry || 0,
    ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
  )

  // check if email is valid or person is admin
  if (
    !checkValidStudentOrParentEmail(person.email) &&
    !checkValidAdminEmail(person.email)
  ) {
    throw errorResponses.account()
    // throw redirectToSignin(request, { authstate: `not-parent-account` })
  }

  logger.debug(`💥 start: upsert prisma`)
  let start3 = performance.now()

  let userPrisma = await prisma.user.findUnique({
    where: {
      email: person.email,
    },
  })
  if (!userPrisma) {
    userPrisma = await prisma.user.create({
      data: {
        first: person.first,
        last: person.last,
        email: person.email,
        picture: person.picture,
        role: "USER",
        activated: true,

        stats: {
          create: {
            count: 1,
            lastVisited: new Date(),
          },
        },
      },
    })
  }
  // let userPrisma = await prisma.user.upsert({
  //   where: {
  //     email: person.email,
  //   },
  //   update: {},
  //   create: {
  //     first: person.first,
  //     last: person.last,
  //     email: person.email,
  //     picture: person.picture,
  //     role: "USER",
  //   },
  // })
  let end3 = performance.now()
  logger.debug(
    `🔥   end: upsert prisma \t\ttime: ${(end3 - start3).toFixed(2)} ms`,
  )

  // convert parent email to student email
  let studentEmail = person.email.replace(/^p/, "b")
  logger.debug(`🍓 signin: studentEmail ${studentEmail}`)

  // find student in prisma db with student email even if user is parent
  // const studentPrisma = await getStudentDBByEmail(studentEmail)

  logger.debug(`💥 start: getStudentByEmail`)
  let start4 = performance.now()
  // TODO: check if student is in db
  let studentPrisma = await prisma.student.findUnique({
    where: {
      email: studentEmail,
    },
  })
  let student
  if (!studentPrisma) {
    student = await getStudentByEmail(studentEmail)
  }
  let end4 = performance.now()
  logger.debug(
    `🔥   end: getStudentByEmail time: \t\t${(end4 - start4).toFixed(2)} ms`,
  )
  if (!student && !studentPrisma) {
    errorResponses.account()
    // throw redirectToSignin(request, { authstate: `not-seig-account` })
  }

  logger.debug(`💥 start: transaction`)
  let start5 = performance.now()

  const statsUpsert = prisma.stats.upsert({
    where: {
      userId: userPrisma.id,
    },
    update: {},
    create: {
      userId: userPrisma.id,
    },
  })

  const credentialUpsert = prisma.credential.upsert({
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
  })
  let studentUpsert
  if (!studentPrisma && student) {
    studentUpsert = prisma.student.upsert({
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
    })
  }

  const userUpdate = prisma.user.update({
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

  // if student is not in db, create student
  if (!studentPrisma && studentUpsert) {
    await prisma.$transaction([
      statsUpsert,
      credentialUpsert,
      studentUpsert,
      userUpdate,
    ])
  } else {
    await prisma.$transaction([statsUpsert, credentialUpsert, userUpdate])
  }
  let end5 = performance.now()
  logger.debug(
    `🔥   end: transaction \t\ttime: ${(end5 - start5).toFixed(2)} ms`,
  )

  const st = student || studentPrisma

  if (["ADMIN", "SUPER"].includes(userPrisma.role)) {
    return {
      userId: userPrisma.id,
      folderId: null,
      accessToken: access_token,
    }
  }

  if (!st?.folderLink) {
    throw errorResponses.folder()
    // throw new Response(`no-folder`, { status: 401 })
  }
  const folderId = getFolderId(st.folderLink)

  return {
    userId: userPrisma.id,
    folderId,
    accessToken: access_token,
  }
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
  // console.log("✅ getFolderIdFromEmail", email)
  const student = await getStudentByEmail(email)

  if (!student?.folderLink) {
    // throw Error(`no-folder`)
    throw errorResponses.folder()
  }

  const folderId = getFolderId(student?.folderLink)

  return folderId
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
