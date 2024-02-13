import type { User } from "~/types"
import { GaxiosError } from "gaxios"
import { prisma } from "./db.server"
import { logger } from "../logger"
// import { returnDriveFileData } from "./drive-file-data.server"
import { redirectToSignin } from "../responses"

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
  // driveFileData: {
  //   select: {
  //     fileId: true,
  //     name: true,
  //     mimeType: true,
  //     iconLink: true,
  //     hasThumbnail: true,
  //     thumbnailLink: true,
  //     webViewLink: true,
  //     webContentLink: true,
  //     parents: true,
  //     appProperties: true,
  //     createdTime: true,
  //     modifiedTime: true,
  //     views: true,
  //     firstSeen: true,
  //     lastSeen: true,
  //   },
  // },
}

// // Get UserBase
// // used in `getUserBaseFromSession`
// export async function getUserByEmail(email: string): Promise<User | null> {
//   logger.debug(`👑 getUserByEmail: email: ${email}`)
//   const user: User | null = await prisma.user.findUnique({
//     where: {
//       email,
//       credential: {
//         expiry: { gt: new Date() },
//       },
//     },
//     select: {
//       ...selectUser,
//     },
//   })

//   logger.debug(
//     `✅ services/user.server.ts ~ 	🌈 user.credential.expiry ✅ ${user
//       ?.credential?.expiry} - ${new Date(
//       user?.credential?.expiry || 0,
//     ).toLocaleString()}`,
//   )

//   if (!user || !user.credential) {
//     return null
//   }

//   if (!user.stats) user.stats = null

//   return user
//   // return returnUser(user)
// }

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

    // const refreshUser = await prisma.user.findUnique({
    //   where: {
    //     id: userId,
    //     credential: {
    //       refreshTokenExpiry: { gt: new Date() },
    //     },
    //   },
    //   select: {
    //     ...selectUser,
    //   },
    // })

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

  // return returnUser(user)
}

export async function getRefreshUserById(userId: number): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
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

    if (!user || !user.credential) {
      return null
    }

    if (!user.stats) user.stats = null

    return user
  } catch (error) {
    if (error instanceof GaxiosError) {
      console.error(`👑 getRefreshUserById: GaxiosError: ${error.message}`)
      // throw new Error(`ユーザー情報の取得に失敗しました。`)
      return null
    } else if (error instanceof Error) {
      console.error(`👑 getRefreshUserById: Error: ${error.message}`)
      // throw new Error(`ユーザー情報の取得に失敗しました。`)
      return null
    } else {
      console.error(`👑 getRefreshUserById: unknown error: ${error}`)
      // throw new Error(`ユーザー情報の取得に失敗しました。`)
      return null
    }
  }

  // return returnUser(user)
}

// export async function getRefreshUserByEmail(
//   email: string,
// ): Promise<User | null> {
//   const user = await prisma.user.findUnique({
//     where: {
//       email,
//       credential: {
//         refreshTokenExpiry: { gt: new Date() },
//       },
//     },
//     select: {
//       ...selectUser,
//     },
//   })

//   if (!user || !user.credential) {
//     return null
//   }

//   if (!user.stats) user.stats = null

//   return user
//   // return returnUser(user)
// }

export async function requireUserRole(request: Request, user: User) {
  logger.debug("👑 requireUserRole start")

  if (user && !["SUPER", "ADMIN", "MODERATOR", "USER"].includes(user.role)) {
    throw redirectToSignin(request)
  }
}

export async function requireAdminRole(request: Request, user: User) {
  logger.debug("👑 requireAdminRole start")

  if (user && !["SUPER", "ADMIN"].includes(user.role)) {
    throw redirectToSignin(request)
  }
}

export async function getUsers(): Promise<User[] | null> {
  const users = await prisma.user.findMany({
    orderBy: [
      // {
      //   stats: {
      //     count: "desc",
      //   },
      // },
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

// export async function getUserById(id: number): Promise<User | null> {
//   const user = await prisma.user.findUnique({
//     where: {
//       id,
//     },
//     select: {
//       ...selectUser,
//     },
//   })

//   if (!user || !user.credential) {
//     return null
//   }

//   return user
//   // return returnUser(user)
// }

export async function updateUser(userId: number) {
  return await prisma.user.update({
    where: {
      id: userId,
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
}

//-------------------------------------------
// LOCAL FUNCTIONS
//-------------------------------------------

function returnUsers(prismaUsers: User[]) {
  return prismaUsers.map((user) => user)
}

// export function returnUser(user: any): User {
//   // let st: Pick<User, "student">

//   // if (user.student) {
//   //   st = {
//   //     student: {
//   //       ...user.student,
//   //     },
//   //   }
//   // }

//   let cred: Pick<User, "credential">

//   if (user.credential) {
//     cred = {
//       credential: {
//         ...user.credential,
//       },
//       // userId: user.credential.userId,
//       // accessToken: user.credential.accessToken,
//       // expiry: user.credential.expiry,
//       // refreshToken: user.credential.refreshToken,
//       // refreshTokenExpiry: user.credential.refreshTokenExpiry,
//       // createdAt: user.credential.createdAt,
//     }
//   }

//   if (!user.credential)
//     return {
//       ...user,
//     }

//   if (!user.stats)
//     return {
//       ...user,
//       credential: cred || null,
//       stats: null,
//       student: student || null,
//       driveFileData: returnDriveFileData(user.driveFileData || []),
//     }

//   // const { accessToken, expiry } = user.credential
//   const { count, lastVisited } = user.stats

//   if (!user.driveFileData) {
//     return {
//       ...user,
//       credential: cred,
//       stats: {
//         count,
//         lastVisited,
//       },
//       student: student || null,
//       driveFileData: returnDriveFileData(user.driveFileData || []),
//     }
//   }

//   return {
//     ...user,
//     credential: cred,
//     stats: {
//       count,
//       lastVisited,
//     },
//     student: student || null,
//     driveFileData: returnDriveFileData(user.driveFileData),
//   }
// }

/*

export function returnUser(user: PrismaUserWithAll): User {
  const {
    id,
    last,
    first,
    email,
    picture,
    activated,
    createdAt,
    updatedAt,
    studentGakuseki,
    role,
  } = user

  let student: Student | null = null

  if (user.student) {
    student = {
      ...user.student,
      expiry: Number(user.student.expiry),
    }
  }

  let cred: Credential | null = null

  if (user.credential) {
    cred = {
      accessToken: user.credential.accessToken,
      expiry: Number(user.credential.expiry),
      refreshToken: user.credential.refreshToken,
      refreshTokenExpiry: Number(user.credential.refreshTokenExpiry),
      createdAt: user.credential.createdAt,
    }
  }

  if (!user.credential)
    return {
      id,
      last,
      first,
      email,
      picture,
      activated,
      createdAt,
      updatedAt,
      role,
      credential: null,
      stats: user.stats || null,
      student: student ? student : null,
      studentGakuseki,
    }

  if (!user.stats)
    return {
      id: Number(id),
      last,
      first,
      email,
      picture,
      activated,
      createdAt,
      updatedAt,
      role,
      credential: cred || null,

      stats: null,
      student: student || null,
      studentGakuseki,
    }

  // const { accessToken, expiry } = user.credential
  const { count, lastVisited } = user.stats

  if (!user.driveFileData) {
    return {
      id,
      last,
      first,
      email,
      picture,
      activated,
      createdAt,
      updatedAt,
      role,
      credential: cred,
      stats: {
        count,
        lastVisited,
      },
      student: student || null,
      studentGakuseki,
    }
  }

  return {
    id,
    last,
    first,
    email,
    picture,
    activated,
    createdAt,
    updatedAt,
    role,
    credential: cred,
    stats: {
      count,
      lastVisited,
    },
    student: student || null,
    studentGakuseki,
    driveFileData: returnDriveFileData(user.driveFileData),
  }
}

Type '
{ picture: string; 
  id: number; 
  role: Role; 
  email: string; 
  first: string; 
  last: string; 
  activated: boolean; 
  createdAt: Date; 
  updatedAt: Date; 
  credential: { 
      accessToken: string; 
      expiry: bigint; 
  } | null; 
  stats: { ...; } | 
  null; }[]' 
  
  is not assignable to type 
  'User[]'.
  Type '
  
  id: number
  first: string
  last: string
  email: string
  picture: string
  role: Role
  activated: boolean
  createdAt: Date
  updatedAt: Date
  credential: {
    accessToken: string
    expiry: number
  } | null
  stats: {
    count: number
    lastVisited: Date
  } | null

  { 
    id: number; 
    first: string; 
    last: string; 
    email: string; 
    picture: string; 
    role: Role; 
    activated: boolean; 
    createdAt: Date; 
    updatedAt: Date; 
    credential: { 
      accessToken: string; 
      expiry: bigint; 
    } | null; 
    stats: { ...; } | 
    null; }' is not assignable to type '
    User'.
    Types of property 'credential' are incompatible.

    */
