import type { User } from "~/types"
import { GaxiosError } from "gaxios"
import { prisma } from "./db.server"
import { logger } from "../logger"
import { toLocaleString } from "../utils"

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
): Promise<{ user: User | null; refreshUser: User | null }> {
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
    logger.debug(
      `👑 getUserById: userId: ${userId}, expiry: ${toLocaleString(user?.credential?.expiry || 0)}`,
    )

    if (user) {
      return { user, refreshUser: user }
    }

    const refreshUser: User | null = await prisma.user.findUnique({
      where: {
        id: userId,
        credential: {
          refreshTokenExpiry: { gt: new Date() },
        },
      },
      select: {
        ...selectUser,
      },
    })

    if (refreshUser) {
      return { user: null, refreshUser }
    }

    return { user: null, refreshUser: null }
  } catch (error) {
    if (error instanceof GaxiosError) {
      console.error(`👑 getUserById: GaxiosError: ${error.message}`)
      // throw new Error(`ユーザー情報の取得に失敗しました。`)
      return { user: null, refreshUser: null }
    } else if (error instanceof Error) {
      console.error(`👑 getUserById: Error: ${error.message}`)
      // throw new Error(`ユーザー情報の取得に失敗しました。`)
      return { user: null, refreshUser: null }
    } else {
      console.error(`👑 getUserById: unknown error: ${error}`)
      // throw new Error(`ユーザー情報の取得に失敗しました。`)
      return { user: null, refreshUser: null }
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

export async function updateUserCredential(
  userId: number,
  accessToken: string,
  expiryDate: number,
) {
  if (accessToken && expiryDate) {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        credential: {
          update: {
            accessToken,
            expiry: new Date(expiryDate),
          },
        },
      },
      select: {
        ...selectUser,
      },
    })
    return user
  } else {
    return null
  }
}

//-------------------------------------------
// LOCAL FUNCTIONS
//-------------------------------------------

function returnUsers(prismaUsers: User[]) {
  return prismaUsers.map((user) => user)
}
