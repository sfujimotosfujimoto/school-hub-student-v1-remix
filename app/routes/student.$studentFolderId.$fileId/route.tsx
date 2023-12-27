import {
  type MetaFunction,
  type LoaderFunctionArgs,
  json,
  defer,
} from "@remix-run/node"

import React from "react"

import type { DriveFile } from "~/types"
import { getUserFromSession } from "~/lib/services/session.server"
import { logger } from "~/lib/logger"
import { requireUserRole } from "~/lib/require-roles.server"

import ErrorBoundaryDocument from "~/components/error-boundary-document"

import ToFolderBtn from "./to-folder-button"
import BackButton from "~/components/back-button"
import StudentCard from "../student.$studentFolderId._index/components/student-card"

import type { loader as studentFolderIdLoader } from "../student.$studentFolderId/route"
import { useParams, useRouteLoaderData } from "@remix-run/react"
import { redirectToSignin } from "~/lib/responses"
import { updateDriveFileData } from "~/lib/services/drive-file-data.server"
import type { DriveFileData } from "@prisma/client"

/**
 * Loader Function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: student.$studentFolderId.$fileId ${request.url}`)
  const user = await getUserFromSession(request)
  if (!user) throw redirectToSignin()
  await requireUserRole(user)

  const { fileId } = params

  let dfp: Promise<DriveFileData | undefined>
  if (fileId) {
    dfp = updateDriveFileData(fileId)

    return defer(
      {
        driveFileDatum: dfp,
      },
      {
        headers: {
          "Cache-Control": "max-age=300",
        },
      },
    )
  }

  return json(null, {
    headers: {
      "Cache-Control": "max-age=300",
    },
  })
}

/**
 * Meta Function
 */
export const meta: MetaFunction = () => {
  // added
  // const title =
  //   `${data?.student.gakunen}${data?.student.hr}${data?.student.hrNo}${data?.student.last}${data?.student.first}` ||
  //   ""

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
  console.log("✅ student.$studentFolderId2.$fileId/route.tsx ~ 	😀")
  const { fileId } = useParams()
  const props = useRouteLoaderData<typeof studentFolderIdLoader>(
    "routes/student.$studentFolderId",
  )

  if (!props) {
    console.error(`🚨 `)
    throw new Error("no props")
  }

  const { driveFiles } = props

  const dfs = React.useMemo(() => {
    return driveFiles
  }, [driveFiles])

  // find driveFileDatum from driveFileData[]
  const driveFile: DriveFile | undefined = dfs?.find((r) => r.id === fileId)

  // JSX -------------------------
  return (
    <>
      {/* Buttons */}
      <div className="flex items-center gap-4">
        <BackButton />
        {/* <BackButton to={`/student/${studentFolderId}`} /> */}

        {driveFile && driveFile.parents && (
          <ToFolderBtn parentId={driveFile.parents[0]} />
        )}
      </div>

      {/* Student file card */}
      <div className="mt-4">
        {driveFile && (
          <a
            id="_StudentCard"
            target="_blank"
            rel="noopener noreferrer"
            href={`${driveFile.link}`}
          >
            <StudentCard driveFile={driveFile} thumbnailSize={"big"} />
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
