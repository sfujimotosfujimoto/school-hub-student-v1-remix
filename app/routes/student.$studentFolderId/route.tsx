import invariant from "tiny-invariant"
import * as driveS from "~/lib/google/drive.server"
import * as sheetsS from "~/lib/google/sheets.server"
import * as userS from "~/lib/user.server"
import { filterSegments, getFolderId } from "~/lib/utils"

import {
  redirect,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

import StudentHeader from "./StudentHeader"

import type { DriveFileData, StudentData } from "~/types"

/**
 * StudentFolderIdLayout
 * path = /student.$studentFolderId
 */
export default function StudentFolderIdLayout() {
  const { student } = useLoaderData<typeof loader>()

  // JSX -------------------------
  return (
    <div className="container h-screen p-8 mx-auto pt-14 sm:pt-8">
      <div className="mb-4 space-y-4">
        {student && <StudentHeader student={student} />}
      </div>
      <Outlet />
    </div>
  )
}

/**
 * Loader Function for student.$studentFolderId
 * path = /student.$studentFolderId
 *
 * @export
 * @param {LoaderArgs} { request, params }
 * @return {*}  {(Promise<{
 *   extensions: string[]
 *   segments: string[]
 *   driveFileData: DriveFileData[] | null
 *   student: StudentData
 * }>)}
 */
export async function loader({ request, params }: LoaderArgs): Promise<{
  extensions: string[]
  segments: string[]
  driveFileData: DriveFileData[] | null
  student: StudentData
}> {
  const user = await userS.requireUserRole(request)
  if (!user || !user.credential) throw redirect("/?authstate=unauthorized")

  const student = await sheetsS.getStudentDatumByEmail(user.email)

  if (!student || !student.folderLink)
    throw redirect("/?authstate=unauthorized")

  if (getFolderId(student.folderLink) !== params.studentFolderId) {
    throw redirect("/?authstate=unauthorized")
  }

  const studentFolderId = params.studentFolderId
  invariant(studentFolderId, "studentFolder in params is required")

  const driveFileData = await driveS.getDriveFiles(
    user.credential.accessToken,
    `trashed=false and '${studentFolderId}' in parents`
  )

  let segments = Array.from(
    new Set(driveFileData?.map((d) => d.name.split(/[-_.]/)).flat())
  )

  segments = filterSegments(segments, student)

  const extensions =
    Array.from(new Set(driveFileData?.map((d) => d.mimeType))).map(
      (ext) => ext.split(/[/.]/).at(-1) || ""
    ) || []

  return {
    extensions,
    segments,
    driveFileData,
    student,
  }
}

/**
 * Meta Function
 */
export const meta: V2_MetaFunction = ({
  data,
}: {
  data: { rows: any; student: StudentData }
}) => {
  const title =
    `${data?.student.gakunen}${data?.student.hr}${data?.student.hrNo}${data?.student.last}${data?.student.first}` ||
    ""

  return [
    {
      title: `${title} | SCHOOL HUB`,
    },
  ]
}
