import type { PrismaUser, User } from "~/types"

import { prisma } from "./db.server"
import * as sessionS from "./session.server"
import { redirect } from "@remix-run/node"
import { Role } from "@prisma/client"

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
      expiryDate: true,
    },
  },
  stats: {
    select: {
      count: true,
      lastVisited: true,
    },
  },
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

export async function requireUserRole(request: Request): Promise<User> {
  const payload = await sessionS.requireUserSession(request)

  const user = await getUserByEmail(payload.email)

  if (!user?.credential) {
    throw redirect("/?authstate=no-login")
  }

  if (user && !user.activated) {
    throw redirect("/?authstate=not-activated")
  }

  if (user && ![Role.ADMIN, Role.USER].includes(user.role)) {
    throw redirect("/?authstate=unauthorized")
  }
  return user
}

export async function requireAdminRole(request: Request) {
  const payload = await sessionS.requireUserSession(request)

  const user = await getUserByEmail(payload.email)

  if (!user?.credential) {
    throw redirect("/?authstate=no-login")
  }

  if (user && !user.activated) {
    throw redirect("/?authstate=not-activated")
  }

  if (user && user.role !== Role.ADMIN) {
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
export function returnUser(user: PrismaUser) {
  const {
    id,
    last,
    first,
    email,
    picture,
    activated,
    createdAt,
    updatedAt,
    role,
  } = user

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
    }
  if (!user.stats)
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
      credential:
        {
          accessToken: user.credential.accessToken,
          expiryDate: Number(user.credential.expiryDate),
        } || null,
      stats: null,
    }

  const { accessToken, expiryDate } = user.credential
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
    credential: {
      accessToken,
      // expiryDate,
      expiryDate: Number(expiryDate),
    },
    stats: {
      count,
      lastVisited,
    },
  }
}

function returnUsers(prismaUsers: PrismaUser[]) {
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
      expiryDate: bigint; 
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
    expiryDate: number
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
      expiryDate: bigint; 
    } | null; 
    stats: { ...; } | 
    null; }' is not assignable to type '
    User'.
    Types of property 'credential' are incompatible.

    */
