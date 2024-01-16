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

//update timeout
export const config = {
  // TODO: set maxDuration for production
  maxDuration: 60,
}

export async function loader({ request }: LoaderFunctionArgs) {
  // get code from url query
  const parsedUrl = new URL(request.url)
  const code = parsedUrl.searchParams.get("code")

  // if no "code" , do not touch and resolve
  if (!code) throw redirectToSignin(request)

  console.log(`💥 start: signin()`)
  let start1 = performance.now()
  const { folderId, accessToken, userId } = await signin({
    request,
    code,
  })
  let end1 = performance.now()
  console.log(`🔥   end: signin() time: ${end1 - start1} ms`)

  if (folderId === null && userId) {
    return createUserSession(userId, `/admin`)
  }

  console.log(`💥 start: getDriveFiles`)
  let start2 = performance.now()
  // Get drive files from Google Drive API
  const driveFiles = await getDriveFiles(
    accessToken,
    `trashed=false and '${folderId}' in parents`,
  )
  let end2 = performance.now()
  console.log(`🔥   end: getDriveFiles time: ${end2 - start2} ms`)

  console.log(`💥 start: saveDriveFileData`)
  let start3 = performance.now()
  // Save drive files to DB
  await saveDriveFileData(userId, driveFiles)
  let end3 = performance.now()
  console.log(`🔥   end: saveDriveFileData time: ${end3 - start3} ms`)

  console.log(`💥 start: updateThumbnails`)
  let start4 = performance.now()
  await updateThumbnails(driveFiles)
  let end4 = performance.now()
  console.log(`🔥   end: updateThumbnails time: ${end4 - start4} ms`)

  return createUserSession(userId, `/student/${folderId}`)
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
