import type { Credential, PrismaUserWithAll, Student, User } from "~/types"

import { prisma } from "./db.server"
import { redirect } from "@remix-run/node"
import { logger } from "./logger"

const selectUser = {
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
      users: true,
    },
  },
  studentGakuseki: true,
}
// Get UserBase
// used in `getUserBaseFromSession`
export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      ...selectUser,
    },
  })

  if (!user || !user.credential) {
    return null
  }

  if (!user.stats) user.stats = null

  return returnUser(user)
}

export async function requireUserRole(user: User) {
  logger.debug("👑 requireUserRole start")

  if (user && !["SUPER", "ADMIN", "MODERATOR", "USER"].includes(user.role)) {
    throw redirect("/?authstate=unauthorized")
  }
}

export async function requireAdminRole(user: User) {
  logger.debug("👑 requireAdminRole start")

  if (user && !["SUPER", "ADMIN"].includes(user.role)) {
    throw redirect("/?authstate=unauthorized")
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

export async function getUserById(id: number): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      ...selectUser,
    },
  })

  if (!user || !user.credential) {
    return null
  }

  return returnUser(user)
}

//-------------------------------------------
// LOCAL FUNCTIONS
//-------------------------------------------
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

function returnUsers(prismaUsers: PrismaUserWithAll[]) {
  return prismaUsers.map((user) => returnUser(user))
}

/*


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
