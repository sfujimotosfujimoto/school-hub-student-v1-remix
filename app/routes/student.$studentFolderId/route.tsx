//-------------------------------------------
// student.$studentFolderId.tsx
// Layout
//-------------------------------------------
import invariant from "tiny-invariant"

import {
  type LoaderArgs,
  type V2_MetaFunction,
  redirect,
  fetch,
} from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

import StudentHeader from "./StudentHeader"
import type { DriveFileData, StudentData } from "~/types"
import { requireUserRole } from "~/lib/user.server"
import { getDriveFiles } from "~/lib/google/drive.server"
import { filterSegments, getFolderId } from "~/lib/utils"
import { kv } from "@vercel/kv"
import { logger } from "~/lib/logger"
import { getStudentDatumByEmail2 } from "~/lib/student.server"

/**
 * StudentFolderIdLayout
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
 * Loader
 * get
 * - rows: DriveFileData[]
 * - student: StudentData
 */
export async function loader({ request, params }: LoaderArgs): Promise<{
  extensions: string[]
  segments: string[]
  driveFileData: DriveFileData[] | null
  student: StudentData
}> {
  console.log("🚀 routes/$studentFolderId.tsx ~ 	✨ in loader")
  const user = await requireUserRole(request)
  if (!user || !user.credential) throw Error("unauthorized")

  let studentData: StudentData[]

  const cache = await kv.get<StudentData[] | null>("studentData")

  if (cache) {
    logger.info("🎁 cache hit")
    studentData = cache
  } else {
    logger.info("🎁 no cache")
    const data = await (
      await fetch(`${process.env.BASE_URL}/student-data`, { method: "POST" })
    ).json()

    if (data) {
      await kv.set("studentData", data.studentData, { ex: 60 })
    }
    studentData = data.studentData
  }

  const student = await getStudentDatumByEmail2(studentData, user.email)

  if (!student || !student.folderLink)
    throw redirect("/?authstate=unauthorized")

  if (getFolderId(student.folderLink) !== params.studentFolderId) {
    throw redirect("/?authstate=unauthorized")
  }

  const studentFolderId = params.studentFolderId
  invariant(studentFolderId, "studentFolder in params is required")

  const driveFileData = await getDriveFiles(
    user.credential.accessToken,
    `trashed=false and '${studentFolderId}' in parents`
  )
  console.log("🚀 student.$studentFolderId/route.tsx ~ 	😀 after driveFileData")

  let segments = Array.from(
    new Set(driveFileData?.map((d) => d.name.split(/[-_.]/)).flat())
  )

  console.log("🚀 student.$studentFolderId/route.tsx ~ 	😀 after segments")
  segments = filterSegments(segments, student)

  const extensions =
    Array.from(new Set(driveFileData?.map((d) => d.mimeType))).map(
      (ext) => ext.split(/[/.]/).at(-1) || ""
    ) || []

  console.log("🚀 student.$studentFolderId/route.tsx ~ 	😀 after extensions")

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
