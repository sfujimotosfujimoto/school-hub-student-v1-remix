import invariant from "tiny-invariant"

import { type LoaderArgs, json, type V2_MetaFunction } from "@remix-run/node"
import {
  Link,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react"

import { requireUserSession } from "~/lib/session.server"

import { getDrive } from "~/lib/google.server"

import LeftArrow from "~/components/icons/LeftArrow"
import type { Permission, RowType, StudentData } from "~/types"
import { getUserWithCredential } from "~/lib/user.server"
import { type drive_v3 } from "googleapis"
import StudentCard from "~/components/student.$studentFolderId/StudentCard"

import { loader as studentLoader } from "~/routes/student.$studentFolderId"
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
  const { studentFolderId, fileId } = useParams()
  const { rows, student } = useRouteLoaderData(
    "routes/student.$studentFolderId"
  ) as ReturnType<() => { rows: RowType[]; student: StudentData }>

  // console.log(
  //   "🚀 routes/student.$studentFolderId.$fileId.tsx ~ 	🌈 permissions ✨ ",

  //   permissions
  // )

  const row = rows.find((r) => r.id === fileId)

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
        {row && <StudentCard rowData={row} thumbnailSize={"big"} />}
      </div>
      <div className="mt-4">
        <PermissionTags permissions={permissions} />
      </div>
    </>
  )
}

function PermissionTags({ permissions }: { permissions: Permission[] }) {
  const owner = permissions.find((p) => p.role === "owner")
  const student = permissions.find((p) => getStudentEmail(p.emailAddress))
  const others = permissions.filter(
    (p) => p.id !== owner?.id && p.id !== student?.id
  )

  const h2Style = `mt-4 text-sm font-semibold sm:text-lg`
  const gridStyle = `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3`

  return (
    <>
      <h2 className={` ${h2Style}`}>生徒</h2>
      <div className={`${gridStyle} gap-4`}>
        {student && (
          <PermissionTag permission={student} classes="bg-sfgreen-100" />
        )}
      </div>
      <h2 className={`mt-4 ${h2Style}`}>オーナー</h2>
      <div className={`${gridStyle} gap-4`}>
        {owner && (
          <PermissionTag permission={owner} classes="bg-sfyellow-100" />
        )}
      </div>
      <h2 className={`mt-4 ${h2Style}`}>共有</h2>
      <div className={`${gridStyle} gap-4`}>
        {permissions &&
          others.map((p) => (
            <PermissionTag
              key={p.id}
              permission={p}
              classes={"bg-sfyellow-100"}
            />
          ))}
      </div>
    </>
  )
}

function PermissionTag({
  permission,
  classes,
}: {
  permission: Permission
  classes: string
}) {
  const textStyle = `text-sm sm:text-base truncate`
  return (
    <div className={`rounded p-4 ${classes} relative`}>
      <div className="flex flex-col place-content-center">
        <span className={`font-semibold ${textStyle}`}>
          {permission.displayName}
        </span>
        <span className={`${textStyle}`}>{permission.emailAddress}</span>
        <RoleTag role={permission.role} />
      </div>
    </div>
  )
}

function RoleTag({ role }: { role: string }) {
  let color = ""

  switch (role) {
    case "writer": {
      color = "bg-sfgreen-400"
      break
    }
    case "owner": {
      color = "bg-sfred-400"
      break
    }
    case "reader": {
      color = "bg-sfyellow-400"
      break
    }
  }

  return (
    <span
      className={`absolute right-1 top-1 rounded-lg ${color} p-1 text-xs sm:text-sm `}
    >
      {roleToText(role)}
    </span>
  )
}

function getStudentEmail(email: string) {
  const regex = RegExp(
    /(b[0-9]{5,}@seig-boys.jp|samples[0-9]{2}@seig-boys.jp)/
    // /(b[0-9]{5,}@seig-boys.jp|samples[0-9]{2}@seig-boys.jp|s-tamaki@seig-boys.jp)/
  )

  const matches = email.match(regex)

  if (!matches) return null
  return matches[0]
}

function roleToText(role: string) {
  switch (role) {
    case "writer": {
      return "編集者"
    }

    case "reader": {
      return "閲覧者"
    }

    case "owner": {
      return "オーナー"
    }
  }
}
