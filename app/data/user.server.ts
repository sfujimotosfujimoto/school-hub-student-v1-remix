import * as jose from "jose"
import invariant from "tiny-invariant"
import type { IdToken, UserBase, UserWithCredential } from "~/types"

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

      email: true,
      Credential: {
        select: {
          accessToken: true,
          idToken: true,
          expiryDate: true,
        },
      },
    },
  })

  if (!user || !user.Credential) {
    return null
  }

  const idToken = jose.decodeJwt(user.Credential.idToken) as IdToken

  return {
    last: idToken.family_name,
    first: idToken.given_name,
    email: idToken.email,
    picture: idToken.picture,
    exp: idToken.exp,
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
          idToken: true,
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
