import { type LoaderFunctionArgs } from "@remix-run/node"

import { signin } from "~/lib/signinout.server"

import ErrorBoundaryDocument from "~/components/error-boundary-document"
import { redirectToSignin } from "~/lib/responses"
import { createUserSession } from "~/lib/services/session.server"
import { getDriveFiles } from "~/lib/google/drive.server"
import {
  saveDriveFileData,
  updateThumbnails,
} from "~/lib/services/drive-file-data.server"

export async function loader({ request }: LoaderFunctionArgs) {
  // get code from url query
  const parsedUrl = new URL(request.url)
  const code = parsedUrl.searchParams.get("code")

  // if no "code" , do not touch and resolve
  if (!code) throw redirectToSignin()

  console.log(`🔥 signin()`)
  let start = performance.now()
  const { folderId, userJWT, accessToken, userId } = await signin({ code })
  let end = performance.now()
  console.log(`🔥 signin() time: ${end - start} ms`)

  if (folderId === null && userJWT.trim()) {
    return createUserSession(userJWT, `/admin`)
  }

  console.log("⭐️ in auth.redirect: before getDriveFiles")
  start = performance.now()
  // Get drive files from Google Drive API
  const driveFiles = await getDriveFiles(
    accessToken,
    `trashed=false and '${folderId}' in parents`,
  )
  end = performance.now()
  console.log(`⭐️before getDriveFiles time: ${end - start} ms`)

  console.log(
    "🐣 in auth.redirect: before saveDriveFileData & updateThumbnails",
  )
  start = performance.now()
  // Save drive files to DB
  await saveDriveFileData(userId, driveFiles)
  await updateThumbnails(driveFiles)
  // const driveFileData = await saveDriveFileData(userId, driveFiles)
  end = performance.now()
  console.log(`🐣Execution time: ${end - start} ms`)

  return createUserSession(userJWT, `/student/${folderId}`)
}

export default function Redirect() {
  return <div>Redirect</div>
}

/**
 * Error Boundary
 */
export function ErrorBoundary() {
  let message = `問題が起きました。`

  return <ErrorBoundaryDocument toHome={true} message={message} />
}
