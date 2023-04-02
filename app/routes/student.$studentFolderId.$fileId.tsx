import invariant from "tiny-invariant"

import { type LoaderArgs, json, type V2_MetaFunction } from "@remix-run/node"
import {
  Link,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react"

import { requireUserSession } from "~/data/session.server"

import { getDrive } from "~/data/google.server"

import LeftArrow from "~/components/icons/LeftArrow"
import type { Permission, RowType, StudentData } from "~/types"
import { getUserWithCredential } from "~/data/user.server"
import { type drive_v3 } from "googleapis"

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
    // TODO: temporary for testing
    const fileId = "1REcOw43A014Tx43d5m546_g7Is-2pOlY"

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

// export const meta: V2_MetaFunction = ({
//   data,
// }: {
//   data: { rows: any; student: StudentData }
// }) => {
//   const title =
//     `${data?.student.gakunen}${data?.student.hr}${data?.student.hrNo}${data?.student.last}${data?.student.first}` ||
//     ""

//   return [
//     {
//       title: `${title} | SCHOOL HUB`,
//     },
//   ]
// }

export default function StudentFolderPage() {
  const { permissions } = useLoaderData<typeof loader>()
  const { studentFolderId } = useParams()
  const { rows, student } = useRouteLoaderData(
    "routes/student.$studentFolderId"
  ) as ReturnType<() => { rows: RowType[]; student: StudentData }>

  console.log(
    "🚀 routes/student.$studentFolderId.$fileId.tsx ~ 	🌈 permissions ✨ ",
    permissions
  )

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
        {permissions &&
          permissions.map((p) => (
            <div key={p.id}>
              <pre>{JSON.stringify(p, null, 2)}</pre>
            </div>
          ))}
      </div>
    </>
  )
}
