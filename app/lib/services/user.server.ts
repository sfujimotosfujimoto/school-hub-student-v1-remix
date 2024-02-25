import type { User } from "~/types"
import { GaxiosError } from "gaxios"
import { prisma } from "./db.server"
import { logger } from "../logger"

export const selectUser = {
  id: true,
  first: true,
  last: true,
  picture: true,
  email: true,
  activated: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  credential: {
    select: {
      accessToken: true,
      expiry: true,
      refreshToken: true,
      refreshTokenExpiry: true,
      createdAt: true,
    },
  },
  stats: {
    select: {
      count: true,
      lastVisited: true,
    },
  },
  student: {
    select: {
      gakuseki: true,
      gakunen: true,
      hr: true,
      hrNo: true,
      last: true,
      first: true,
      sei: true,
      mei: true,
      email: true,
      folderLink: true,
      createdAt: true,
      expiry: true,
    },
  },
  studentGakuseki: true,
}

export async function getUserById(
  userId: number,
): Promise<{ user: User | null }> {
  logger.debug(`👑 getUserById: userId: ${userId}`)

  try {
    const user: User | null = await prisma.user.findUnique({
      where: {
        id: userId,
        credential: {
          expiry: { gt: new Date() },
        },
      },
      select: {
        ...selectUser,
      },
    })

    if (user) {
      return { user }
    }

    return { user: null }
  } catch (error) {
    if (error instanceof GaxiosError) {
      console.error(`👑 getUserById: GaxiosError: ${error.message}`)
      // throw new Error(`ユーザー情報の取得に失敗しました。`)
      return { user: null }
    } else if (error instanceof Error) {
      console.error(`👑 getUserById: Error: ${error.message}`)
      // throw new Error(`ユーザー情報の取得に失敗しました。`)
      return { user: null }
    } else {
      console.error(`👑 getUserById: unknown error: ${error}`)
      // throw new Error(`ユーザー情報の取得に失敗しました。`)
      return { user: null }
    }
  }
}

export async function getUsers(): Promise<User[] | null> {
  const users = await prisma.user.findMany({
    orderBy: [
      {
        stats: {
          lastVisited: "desc",
        },
      },
      {
        updatedAt: "desc",
      },
    ],
    select: {
      ...selectUser,
    },
  })

  if (!users) {
    return null
  }

  return returnUsers(users)
}

//-------------------------------------------
// LOCAL FUNCTIONS
//-------------------------------------------

function returnUsers(prismaUsers: User[]) {
  return prismaUsers.map((user) => user)
}
