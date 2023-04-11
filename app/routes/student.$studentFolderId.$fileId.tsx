import { type LoaderArgs, json, type V2_MetaFunction } from "@remix-run/node"
import {
  Await,
  Link,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react"
import invariant from "tiny-invariant"

import type { Permission, DriveFileData, StudentData } from "~/types"

import { getUserWithCredential } from "~/lib/user.server"
import { requireUserSession } from "~/lib/session.server"

import LeftArrow from "~/components/icons/LeftArrow"
import { type drive_v3 } from "googleapis"
import StudentCard from "~/components/student.$studentFolderId/StudentCard"
import PermissionTags from "~/components/student.$studentFolderId.$fileId/PermissionTags"
import { getDrive } from "~/lib/google/drive.server"

import { loader as studentFolderIdLoader } from "./student.$studentFolderId"

/**
 * Loader Function
 */
export async function loader({ request, params }: LoaderArgs) {
  await requireUserSession(request)

  const studentFolderId = params.studentFolderId
  const fileId = params.fileId

  invariant(studentFolderId, "studentFolder in params is required")
  invariant(fileId, "fileId in params is required")

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
    const permissions = await callPermissions(drive, fileId)

    return {
      permissions,
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
 * call Permissions API
 */
export async function callPermissions(
  drive: drive_v3.Drive,
  fileId: string
): Promise<Permission[]> {
  const fields = "permissions(id,type,emailAddress,role,displayName)"
  const list = await drive.permissions.list({
    fileId,
    fields,
  })

  const permissions = list.data.permissions as Permission[]

  return permissions
}

/**
 * Meta Function
 */
export const meta: V2_MetaFunction = ({
  data,
}: {
  data: { permissions: Permission[] }
}) => {
  // const title =
  //   `${data?.student.gakunen}${data?.student.hr}${data?.student.hrNo}${data?.student.last}${data?.student.first}` ||
  //   ""

  console.log(
    "🚀 routes/student.$studentFolderId.$fileId.tsx ~ 	🌈 data ✨ ",
    data.permissions
  )

  const title = "test"

  return [
    {
      title: `${title} | SCHOOL HUB`,
    },
  ]
}

/**
 * StudentFolderPage
 */
export default function StudentFolderPage() {
  const { permissions } = useLoaderData<typeof loader>()
  const { studentFolderId, fileId } = useParams()
  const { driveFileData } = useRouteLoaderData(
    "routes/student.$studentFolderId"
  ) as Awaited<ReturnType<typeof studentFolderIdLoader>>
  // () => { driveFileData: DriveFileData[]; student: StudentData }

  const driveFileDatum = driveFileData?.find((r) => r.id === fileId)

  return (
    <>
      <div className="flex gap-4">
        <Link
          to={`/student/${studentFolderId}`}
          className="btn-success btn shadow-md hover:bg-sfgreen-400"
        >
          <LeftArrow className="mr-2 h-5 w-5" />
          Back
        </Link>
      </div>
      <div className="mt-4">
        {driveFileDatum && (
          <StudentCard rowData={driveFileDatum} thumbnailSize={"big"} />
        )}
      </div>
      <div className="mt-4">
        <PermissionTags permissions={permissions} />
      </div>
    </>
  )
}
