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
import {
  getDriveFileDataByFileId,
  // updateDriveFileData,
} from "~/lib/services/drive-file-data.server"
import { getUserFromSession } from "~/lib/services/session.server"
import { convertDriveFileDatum } from "~/lib/utils-loader"
import type { DriveFileData } from "~/types"
import StudentCard from "../student.$studentFolderId._index/student-card"
import ToFolderBtn from "./to-folder-button"
import { CACHE_MAX_AGE_SECONDS } from "~/config"

/**
 * Loader Function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: student.$studentFolderId.$fileId ${request.url}`)
  const { user } = await getUserFromSession(request)
  if (!user) throw redirectToSignin(request)
  await requireUserRole(request, user)

  const { fileId } = params
  if (!fileId) throw redirectToSignin(request)

  let dfd: DriveFileData | undefined | null
  // dfd = await updateDriveFileData(fileId)

  dfd = await getDriveFileDataByFileId(fileId)

  const headers = new Headers()

  headers.set("Cache-Control", `private, max-age=${CACHE_MAX_AGE_SECONDS}`)

  return json(
    {
      driveFileDatum: dfd,
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
  const { driveFileDatum } = useLoaderData<SerializeFrom<typeof loader>>()

  if (!driveFileDatum) {
    throw new Error("Could not find file.")
  }

  const dfd = convertDriveFileDatum(driveFileDatum)

  const navigation = useNavigation()
  const isNavigating = navigation.state !== "idle"

  // JSX -------------------------
  return (
    <>
      {/* Buttons */}
      <div className="flex items-center gap-4">
        <BackButton />
        {/* <BackButton to={`/student/${studentFolderId}`} /> */}

        {dfd && dfd.parents && <ToFolderBtn parentId={dfd.parents[0]} />}
      </div>

      {/* Student file card */}
      <div className="mt-4">
        {dfd && (
          <a
            id="_StudentCard"
            target="_blank"
            rel="noopener noreferrer"
            href={`${dfd.webViewLink}`}
          >
            <StudentCard
              driveFile={dfd}
              thumbnailSize={"big"}
              isViewed={dfd.views > 0}
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
