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
import { errorResponses } from "../error-responses"
import { DEV_EXPIRY, DEV_REFERSH_EXPIRY, REFRESH_EXPIRY } from "~/config"
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
  }

  let { access_token, expiry_date, scope, token_type, refresh_token } =
    result.data

  // TODO: !!DEBUG!!: setting expiryDateDummy to 10 seconds
  if (process.env.NODE_ENV === "development") {
    expiry_date = Date.now() + DEV_EXPIRY
  }

  let refreshTokenExpiry = new Date(Date.now() + REFRESH_EXPIRY) // 14 days
  if (process.env.NODE_ENV === "development") {
    refreshTokenExpiry = new Date(Date.now() + DEV_REFERSH_EXPIRY)
  }

  if (!access_token) {
    throw errorResponses.unauthorized()
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
  }

  logger.debug(`💥 start: upsert prisma`)
  let start3 = performance.now()

  let userPrisma = await prisma.user.findUnique({
    where: {
      email: person.email,
    },
  })
  if (!userPrisma) {
    logger.debug(`creating user: ${person.email}`)
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

  let end3 = performance.now()
  logger.debug(
    `🔥   end: upsert prisma \t\ttime: ${(end3 - start3).toFixed(2)} ms`,
  )

  // convert parent email to student email
  let studentEmail = person.email.replace(/^p/, "b")
  logger.info(`🍓 signin: studentEmail ${studentEmail}`)

  // find student in prisma db with student email even if user is parent
  // const studentPrisma = await getStudentDBByEmail(studentEmail)

  logger.debug(`💥 start: getStudentByEmail`)
  let start4 = performance.now()
  // @note services/signinout.server.ts: check if student is in db
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
    // await prisma.$transaction([
    prisma.$transaction([statsUpsert, studentUpsert, userUpdate])
    await prisma.$transaction([credentialUpsert])
  } else {
    prisma.$transaction([statsUpsert, userUpdate])
    await prisma.$transaction([credentialUpsert])
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
