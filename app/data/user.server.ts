import invariant from "tiny-invariant"
import type { UserBase, UserWithCredential } from "~/types"

import { prisma } from "./db.server"
import { getUserBaseFromSession } from "./session.server"

export async function getUserInfo(email: string): Promise<UserBase | null> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      first: true,
      last: true,
      picture: true,
      email: true,
      Credential: {
        select: {
          accessToken: true,
          expiryDate: true,
        },
      },
    },
  })

  if (!user || !user.Credential) {
    return null
  }

  return {
    last: user.last,
    first: user.first,
    email: user.email,
    picture: user.picture,
    exp: Number(user.Credential.expiryDate),
  }
}

export async function getUserWithCredential(
  request: Request
): Promise<UserWithCredential> {
  const userBase = await getUserBaseFromSession(request)
  invariant(userBase, "couldn't get userBase")

  const user = await prisma.user.findUnique({
    where: {
      email: userBase.email,
    },
    select: {
      id: true,
      first: true,
      last: true,

      email: true,
      Credential: {
        select: {
          accessToken: true,
          expiryDate: true,
        },
      },
    },
  })

  invariant(user, "User Data not found")
  invariant(user.Credential, "User Credential not found")
  const outputUser = user as UserWithCredential

  return outputUser
}
