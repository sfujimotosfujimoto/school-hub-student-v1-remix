/**
 * student.$studentFolderId.$fileId.tsx
 */
import { type LoaderArgs, json, type V2_MetaFunction } from "@remix-run/node"
import {
  Link,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react"
import invariant from "tiny-invariant"

import type { Permission } from "~/types"

import { getUserWithCredential } from "~/lib/user.server"
import { requireUserSession } from "~/lib/session.server"

import LeftArrow from "~/components/icons/LeftArrow"
import { type drive_v3 } from "googleapis"
import StudentCard from "~/components/student.$studentFolderId/StudentCard"
import PermissionTags from "~/components/student.$studentFolderId.$fileId/PermissionTags"
import { getDrive } from "~/lib/google/drive.server"

import type { loader as studentFolderIdLoader } from "./student.$studentFolderId"
import FolderIcon from "~/components/icons/FolderIcon"

/**
 * StudentFolderFileIdPage
 */
export default function StudentFolderIdFileIdPage() {
  const { permissions } = useLoaderData<typeof loader>()
  const { studentFolderId, fileId } = useParams()
  const { driveFileData } = useRouteLoaderData(
    "routes/student.$studentFolderId"
  ) as Awaited<ReturnType<typeof studentFolderIdLoader>>

  const driveFileDatum = driveFileData?.find((r) => r.id === fileId)

  // JSX -------------------------
  return (
    <>
      <div className="flex items-center gap-4">
        <Link
          to={`/student/${studentFolderId}`}
          className="btn-success btn shadow-md hover:bg-sfgreen-400"
        >
          <LeftArrow className="mr-2 h-5 w-5" />
          Back
        </Link>
        {driveFileDatum && driveFileDatum.parents && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://drive.google.com/drive/folders/${driveFileDatum.parents[0]}`}
            className={`  h-full rounded-lg bg-sfgreen-200 px-2 py-3 shadow-md transition-all duration-500  hover:-translate-y-1 hover:bg-sfgreen-400`}
          >
            <div className="flex items-center justify-center">
              <FolderIcon class="mr-2 h-6 w-6" />
              フォルダへ
            </div>
          </a>
        )}
      </div>

      {/* Student file card */}
      <div className="mt-4">
        {driveFileDatum && (
          <a
            id="_StudentCard"
            target="_blank"
            rel="noopener noreferrer"
            href={`${driveFileDatum.link}`}
          >
            <StudentCard rowData={driveFileDatum} thumbnailSize={"big"} />
          </a>
        )}
      </div>

      {/* Permissiong Tags List */}
      <div className="mt-4">
        <PermissionTags permissions={permissions} />
      </div>
    </>
  )
}

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

  const title = "test"

  return [
    {
      title: `SCHOOL HUB`,
    },
  ]
}
