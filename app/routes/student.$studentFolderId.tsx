//-------------------------------------------
// student.$studentFolderId.tsx
// Layout
//-------------------------------------------
import invariant from "tiny-invariant"

import { type LoaderArgs, json, type V2_MetaFunction } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

import { requireUserSession } from "~/lib/session.server"

import StudentHeader from "~/components/student.$studentFolderId/StudentHeader"
import type { DriveFileData, StudentData } from "~/types"
import { getUserWithCredential } from "~/lib/user.server"
import { getDriveFiles, getDrive } from "~/lib/google/drive.server"
import {
  getStudentByFolderId,
  getStudentData,
} from "~/lib/google/sheets.server"
import { filterSegments } from "~/lib/utils"

/**
 * StudentFolderIdLayout
 */
export default function StudentFolderIdLayout() {
  const { student } = useLoaderData<typeof loader>()
  // let navigate = useNavigate()

  // let revalidate = useRevalidate()
  // // revalidate()
  // useEffect(() => {
  //   revalidate()
  // }, [])

  // JSX -------------------------
  return (
    <div className="container mx-auto h-screen p-8 pt-14 sm:pt-8">
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
  driveFileData: DriveFileData[] | null
  student: StudentData | null
  segments: string[]
  extensions: string[]
}> {
  await requireUserSession(request)

  const studentFolderId = params.studentFolderId

  invariant(studentFolderId, "studentFolder in params is required")

  let user
  try {
    user = await getUserWithCredential(request)

    // get drive instance
    const drive = await getDrive(user.Credential.accessToken)

    if (!drive) {
      throw json(
        { errorMessage: "Unauthorized Google Account" },
        {
          status: 500,
        }
      )
    }

    // call drive and get DriveFileData[] of student
    const driveFileData = await getDriveFiles(
      drive,
      `trashed=false and '${studentFolderId}' in parents`
    )

    // get StudentData[] from spreadsheet
    const studentData = await getStudentData(user)

    // get StudentData from folder id
    const student = getStudentByFolderId(studentFolderId, studentData)

    let segments = Array.from(
      new Set(driveFileData?.map((d) => d.name.split(/[-_.]/)).flat())
    )

    segments = filterSegments(segments, student)

    // get ex. "pdf", "document"
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
  } catch (error) {
    throw json(
      { errorMessage: "User Data not found" },
      {
        status: 401,
      }
    )
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
