import { type LoaderArgs, json, V2_MetaFunction } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"

import invariant from "tiny-invariant"

import { getEmailFromSession, requireUserSession } from "~/data/auth.server"
import { prisma } from "~/data/database.server"
import {
  callDriveAPI,
  getDrive,
  getStudentByFolderId,
  getStudentData,
} from "~/data/google.server"

import LeftArrow from "~/components/icons/LeftArrow"
import StudentCards from "~/components/_student.student.$studentFolderId/StudentCards"
import StudentHeader from "~/components/_student.student.$studentFolderId/StudentHeader"
import type { StudentData, UserWithCredential } from "~/types"

export async function loader({ request, params }: LoaderArgs) {
  await requireUserSession(request)

  const studentFolderId = params.studentFolderId

  invariant(studentFolderId, "studentFolder in params is required")

  const email = await getEmailFromSession(request)

  const user: UserWithCredential | null = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      first: true,
      last: true,

      email: true,
      Credential: {
        select: {
          accessToken: true,
          idToken: true,
          expiryDate: true,
        },
      },
    },
  })

  if (!user || !user.Credential) {
    return json(
      { errorMessage: "User Data not found" },
      {
        status: 401,
      }
    )
  }

  // get drive instance
  const drive = await getDrive(user.Credential.accessToken)

  if (!drive) {
    return json(
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
  const { rows, student } = useLoaderData()

  return (
    <div className='container mx-auto h-screen p-8 pt-14 sm:pt-8'>
      <div className='mb-4 space-y-4'>
        {student && <StudentHeader student={student} />}
        <div className='flex gap-4'>
          <Link
            to='/student'
            className='btn-success btn shadow-md hover:bg-sfgreen-400'
          >
            <LeftArrow className='mr-2 h-5 w-5' />
            Back
          </Link>
        </div>
      </div>

      <div className='mt-4 mb-12 overflow-x-auto '>
        <StudentCards rows={rows} />
      </div>
    </div>
  )
}
