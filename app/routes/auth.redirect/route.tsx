import { type LoaderFunctionArgs } from "@remix-run/node"

import { signin } from "~/lib/signinout.server"

import ErrorBoundaryDocument from "~/components/error-boundary-document"
import { redirectToSignin } from "~/lib/responses"
import { createUserSession } from "~/lib/services/session.server"
import { getDriveFiles } from "~/lib/google/drive.server"
import { saveDriveFileData } from "~/lib/services/drive-file-data.server"

export async function loader({ request }: LoaderFunctionArgs) {
  // get code from url query
  const parsedUrl = new URL(request.url)
  const code = parsedUrl.searchParams.get("code")

  // if no "code" , do not touch and resolve
  if (!code) throw redirectToSignin()

  const { folderId, userJWT, accessToken, userId } = await signin({ code })

  if (folderId === null && userJWT.trim()) {
    return createUserSession(userJWT, `/admin`)
  }

  // Get drive files from Google Drive API
  const driveFiles = await getDriveFiles(
    accessToken,
    `trashed=false and '${folderId}' in parents`,
  )

  // Save drive files to DB
  await saveDriveFileData(userId, driveFiles)
  // const driveFileData = await saveDriveFileData(userId, driveFiles)

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
