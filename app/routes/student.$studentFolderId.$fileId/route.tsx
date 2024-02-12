import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
  type SerializeFrom,
} from "@remix-run/node"
import { useLoaderData, useNavigation, useParams } from "@remix-run/react"
import BackButton from "~/components/back-button"
import ErrorBoundaryDocument from "~/components/error-boundary-document"
import { logger } from "~/lib/logger"
import { requireUserRole } from "~/lib/require-roles.server"
import { redirectToSignin } from "~/lib/responses"
import { getUserFromSession } from "~/lib/services/session.server"
import { convertDriveFile } from "~/lib/utils-loader"
import StudentCard from "../student.$studentFolderId._index/student-card"
import ToFolderBtn from "./to-folder-button"
import { CACHE_MAX_AGE_SECONDS } from "~/config"
import { getDriveFileByFileId } from "~/lib/google/drive.server"

/**
 * Loader Function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: student.$studentFolderId.$fileId ${request.url}`)
  const { user } = await getUserFromSession(request)
  if (!user || !user.credential) throw redirectToSignin(request)
  const accessToken = user.credential.accessToken
  await requireUserRole(request, user)

  const { fileId } = params
  if (!fileId) throw redirectToSignin(request)

  let driveFile = await getDriveFileByFileId(accessToken, fileId)
  if (!driveFile) throw Error(`Could not find file: ${fileId}`)
  driveFile = convertDriveFile(driveFile)
  // dfd = await getDriveFileDataByFileId(fileId)

  const headers = new Headers()

  headers.set("Cache-Control", `private, max-age=${CACHE_MAX_AGE_SECONDS}`)

  return json(
    {
      driveFile,
    },
    {
      headers,
    },
  )
}

/**
 * Meta Function
 */
export const meta: MetaFunction = () => {
  return [
    {
      title: `SCHOOL HUB`,
    },
  ]
}

/**
 * StudentFolderFileIdPage
 */
export default function StudentFolderIdFileIdPage() {
  // console.log("✅ student.$studentFolderId2.$fileId/route.tsx ~ 	😀")
  const { driveFile } = useLoaderData<SerializeFrom<typeof loader>>()

  if (!driveFile) {
    throw new Error("Could not find file.")
  }

  const df = convertDriveFile(driveFile)

  const navigation = useNavigation()
  const isNavigating = navigation.state !== "idle"

  // JSX -------------------------
  return (
    <>
      {/* Buttons */}
      <div className="flex items-center gap-4">
        <BackButton />
        {/* <BackButton to={`/student/${studentFolderId}`} /> */}

        {df && df.parents && <ToFolderBtn parentId={df.parents[0]} />}
      </div>

      {/* Student file card */}
      <div className="mt-4">
        {df && (
          <a
            id="_StudentCard"
            target="_blank"
            rel="noopener noreferrer"
            href={`${df.webViewLink}`}
          >
            <StudentCard
              driveFile={df}
              thumbnailSize={"big"}
              isNavigating={isNavigating}
            />
          </a>
        )}
      </div>
    </>
  )
}

/**
 * Error Boundary
 */
export function ErrorBoundary() {
  const { studentFolderId, fileId } = useParams()
  let message = `フォルダID（${studentFolderId}）からファイル（${fileId}）を取得できませんでした。`
  return <ErrorBoundaryDocument message={message} />
}
