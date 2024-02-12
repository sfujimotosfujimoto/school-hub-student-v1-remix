import type { ActionFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { REFRESH_EXPIRY } from "~/config"
import { getRefreshedToken } from "~/lib/google/google.server"
import { logger } from "~/lib/logger"
import { returnUser } from "~/lib/return-user"
import { prisma } from "~/lib/services/db.server"

import { selectUser } from "~/lib/services/user.server"
import { getFolderId, toLocaleString } from "~/lib/utils"

export const config = {
  // @note auth.refresh/route.tsx: set maxDuration for production
  maxDuration: 60,
}

/**
 * Loader function
 */
// update base_url in prodc
export async function loader({ request }: ActionFunctionArgs) {
  logger.debug(`🍿 loader: auth.refresh ${request.url}`)

  // get redirect from search params
  const redirectUrl = new URL(request.url).searchParams.get("redirect")
  if (redirectUrl) {
    throw redirect(redirectUrl)
  }

  return json({ ok: true }, 200)
}

//---------------------------------------------------------

/**
 * Action for refresh token
 */
export async function action({ request }: ActionFunctionArgs) {
  logger.debug(`🍺 action: auth.refresh ${request.url}`)

  if (request.method !== "POST") {
    return json({ ok: false, message: "method error" }, { status: 400 })
  }

  const { email, accessToken, refreshToken } = await request.json()

  if (!email || !accessToken || !refreshToken)
    return json(
      { ok: false, message: "no email or accessToken or refreshToken" },
      { status: 400 },
    )

  // 1. refresh token by caling google api
  let {
    access_token: newAccessToken,
    expiry_date,
    refresh_token: newRefreshToken,
  } = await getRefreshedToken(accessToken, refreshToken)

  if (!newAccessToken || !expiry_date)
    return json({ ok: false }, { status: 400 })

  // TODO: !!DEBUG!! expiry date: delete after testing
  // const expiryDateDummy = Date.now() + 1000 * 20 // 20 seconds
  // expiry_date = expiryDateDummy

  logger.debug(
    `✅ in auth.refresh action: expiry ${toLocaleString(
      new Date(Number(expiry_date)),
    )}`,
  )

  const newRefreshTokenExpiry = new Date(Date.now() + REFRESH_EXPIRY)

  logger.debug(
    `✅ in auth.refresh action: newRefreshTokenExpiry ${toLocaleString(newRefreshTokenExpiry)}`,
  )

  // 2. update user.credential in db
  const updatedUser = await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      credential: {
        update: {
          accessToken: newAccessToken,
          expiry: new Date(expiry_date),
          refreshToken: newRefreshToken,
          refreshTokenExpiry: newRefreshTokenExpiry,
        },
      },
    },
    select: {
      ...selectUser,
    },
  })
  if (!updatedUser) {
    return json({ ok: false }, { status: 400 })
  }
  const folderId = getFolderId(updatedUser.student?.folderLink || "")
  // @todo auth.refresh/route.tsx: Update errorResponse
  if (!folderId) {
    return json({ ok: false }, { status: 400 })
  }

  // // Update drive file data in Database,
  // // Must use newAccessToken
  // const driveFiles = await getDriveFiles(
  //   newAccessToken,
  //   `trashed=false and '${folderId}' in parents`,
  // )

  try {
    const newUser = returnUser(updatedUser)

    return json({
      ok: true,
      data: {
        user: newUser,
        // userJWT: userJWT,
      },
    })
  } catch (error) {
    console.error(`❌  error in auth.refresh action:`, error)
    return json({ ok: false }, { status: 400 })
  }
}

// const selectUser = {
//   id: true,
//   first: true,
//   last: true,
//   picture: true,
//   email: true,
//   activated: true,
//   role: true,
//   createdAt: true,
//   updatedAt: true,
//   credential: {
//     select: {
//       accessToken: true,
//       expiry: true,
//       refreshToken: true,
//       refreshTokenExpiry: true,
//       createdAt: true,
//     },
//   },
//   stats: {
//     select: {
//       count: true,
//       lastVisited: true,
//     },
//   },
//   student: true,
// }
