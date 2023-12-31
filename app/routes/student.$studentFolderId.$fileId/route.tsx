import {
  type MetaFunction,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node"

import React from "react"

import type { DriveFileData } from "~/type.d"
import { getUserFromSession } from "~/lib/services/session.server"
import { logger } from "~/lib/logger"
import { requireUserRole } from "~/lib/require-roles.server"

import ErrorBoundaryDocument from "~/components/error-boundary-document"

import ToFolderBtn from "./to-folder-button"
import BackButton from "~/components/back-button"
import StudentCard from "../student.$studentFolderId._index/components/student-card"

import { useLoaderData, useNavigation, useParams } from "@remix-run/react"
import { redirectToSignin } from "~/lib/responses"
import { updateDriveFileData } from "~/lib/services/drive-file-data.server"

/**
 * Loader Function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: student.$studentFolderId.$fileId ${request.url}`)
  const user = await getUserFromSession(request)
  if (!user) throw redirectToSignin(request)
  await requireUserRole(request, user)

  const { fileId } = params
  if (!fileId) throw redirectToSignin(request)

  let dfd: DriveFileData | undefined
  dfd = await updateDriveFileData(fileId)

  return json(
    {
      driveFileDatum: dfd,
    },
    {
      headers: {
        "Cache-Control": "max-age=300",
      },
    },
  )
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
  const { driveFileDatum } = useLoaderData<typeof loader>()
  console.log("✅ driveFileDatum", driveFileDatum)

  const navigation = useNavigation()
  const isNavigating = navigation.state !== "idle"

  // JSX -------------------------
  return (
    <>
      {/* Buttons */}
      <div className="flex items-center gap-4">
        <BackButton />
        {/* <BackButton to={`/student/${studentFolderId}`} /> */}

        {driveFileDatum && driveFileDatum.parents && (
          <ToFolderBtn parentId={driveFileDatum.parents[0]} />
        )}
      </div>

      {/* Student file card */}
      <div className="mt-4">
        {driveFileDatum && (
          <a
            id="_StudentCard"
            target="_blank"
            rel="noopener noreferrer"
            href={`${driveFileDatum.webViewLink}`}
          >
            <StudentCard
              driveFile={driveFileDatum}
              thumbnailSize={"big"}
              isViewed={driveFileDatum.views > 0}
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
