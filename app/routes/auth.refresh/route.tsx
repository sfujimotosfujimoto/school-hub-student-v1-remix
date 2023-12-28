import { json } from "@remix-run/node"
import type { ActionFunctionArgs } from "@remix-run/node"

import { prisma } from "~/lib/db.server"
import { getDriveFiles } from "~/lib/google/drive.server"
import { getRefreshedToken } from "~/lib/google/google.server"
import { logger } from "~/lib/logger"
import { returnUser } from "~/lib/return-user"
import {
  saveDriveFileData,
  updateThumbnails,
} from "~/lib/services/drive-file-data.server"
import { parseVerifyUserJWT } from "~/lib/services/session.server"
import { updateUserJWT } from "~/lib/signinout.server"
import { getFolderId } from "~/lib/utils"

/**
 * Loader function
 */
// update base_url in prodc
export async function loader({ request }: ActionFunctionArgs) {
  logger.debug(`🍿 loader: auth.refresh ${request.url}`)

  return json({ ok: true }, 200)
}

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
    `✅ in auth.refresh action: expiry ${new Date(
      Number(expiry_date),
    ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
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
          expiry: Number(expiry_date),
          refreshToken: newRefreshToken,
          refreshTokenExpiry: Number(Date.now() + 1000 * 60 * 60 * 24),
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
  // TODO: update error response
  if (!folderId) {
    return json({ ok: false }, { status: 400 })
  }

  // Update drive file data in Database
  const driveFiles = await getDriveFiles(
    accessToken,
    `trashed=false and '${folderId}' in parents`,
  )
  await saveDriveFileData(updatedUser.id, driveFiles)
  await updateThumbnails(driveFiles)

  try {
    // 3. update userJWT in session
    const userJWT = await updateUserJWT(
      updatedUser.email,
      expiry_date,
      Number(updatedUser.credential?.refreshTokenExpiry) || 0,
    )
    const payload = await parseVerifyUserJWT(userJWT)
    if (!payload) {
      return json({ ok: false }, { status: 400 })
    }

    logger.debug(
      `✅ in auth.refresh action: new payload.exp ${new Date(
        Number(payload.exp),
      ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
    )
    const newUser = returnUser(updatedUser)

    return json({
      ok: true,
      data: {
        user: newUser,
        userJWT: userJWT,
      },
    })
  } catch (error) {
    console.error(`❌  error in auth.refresh action:`, error)
    return json({ ok: false }, { status: 400 })
  }
}

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
  student: true,
}
