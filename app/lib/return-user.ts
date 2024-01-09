// used in session.server.ts
//-------------------------------------------
// LOCAL FUNCTIONS
//-------------------------------------------

import type { User } from "~/types"

export function returnUser(user: User) {
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
          expiry: user.credential.expiry,
          refreshToken: user.credential.refreshToken,
          refreshTokenExpiry: user.credential.refreshTokenExpiry,
          createdAt: user.credential.createdAt,
        } || null,
      stats: null,
    }

  const {
    accessToken,
    expiry,
    refreshToken,
    refreshTokenExpiry,
    createdAt: credCreatedAt,
  } = user.credential
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
      expiry,
      refreshToken,
      refreshTokenExpiry,
      createdAt: credCreatedAt,
    },
    stats: {
      count,
      lastVisited,
    },
  }
}
