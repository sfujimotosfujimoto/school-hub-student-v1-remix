import invariant from "tiny-invariant"

import { type LoaderArgs, json, type V2_MetaFunction } from "@remix-run/node"
import { Link, Outlet, useLoaderData } from "@remix-run/react"

import { requireUserSession } from "~/data/session.server"

import {
  callDriveAPI,
  getDrive,
  getStudentByFolderId,
  getStudentData,
} from "~/data/google.server"

import LeftArrow from "~/components/icons/LeftArrow"
import StudentCards from "~/components/student.$studentFolderId/StudentCards"
import StudentHeader from "~/components/student.$studentFolderId/StudentHeader"
import type { StudentData } from "~/types"
import { getUserWithCredential } from "~/data/user.server"

export async function loader({ request, params }: LoaderArgs) {
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

    // call drive
    const rows = await callDriveAPI(
      drive,
      `trashed=false and '${studentFolderId}' in parents`
    )

    const studentData = await getStudentData(user)

    const student = getStudentByFolderId(studentFolderId, studentData)

    return {
      rows,
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

export default function StudentFolderPage() {
  const { student } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto h-screen p-8 pt-14 sm:pt-8">
      <div className="mb-4 space-y-4">
        {student && <StudentHeader student={student} />}
      </div>
      <Outlet />
    </div>
  )
}
