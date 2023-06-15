/**
 * student.$studentFolderId.$fileId.tsx
 */
import { type LoaderArgs, type V2_MetaFunction } from "@remix-run/node"
import { Link, useParams, useRouteLoaderData } from "@remix-run/react"

import type { Permission } from "~/types"

import { LeftArrow } from "~/components/icons"
import StudentCard from "~/routes/$studentFolderId._index/StudentCard"

import type { loader as studentFolderIdLoader } from "../$studentFolderId/route"
import ToFolderBtn from "./ToFolderBtn"
import { requireUserSession } from "~/lib/session.server"

/**
 * StudentFolderFileIdPage
 */
export default function StudentFolderIdFileIdPage() {
  // const { permissions } = useLoaderData<typeof loader>()

  const { studentFolderId, fileId } = useParams()
  const { driveFileData } = useRouteLoaderData(
    "routes/$studentFolderId"
  ) as Awaited<ReturnType<typeof studentFolderIdLoader>>

  console.log(
    "🚀 routes/$studentFolderId.$fileId.tsx ~ 	🌈 driveFileData ✨ ",
    driveFileData
  )

  const driveFileDatum = driveFileData?.find((r) => r.id === fileId)

  // JSX -------------------------
  return (
    <>
      <div className="flex items-center gap-4">
        <Link
          to={`/${studentFolderId}`}
          className="btn-success btn shadow-md hover:bg-sfgreen-400"
        >
          <LeftArrow className="mr-2 h-5 w-5" />
          Back
        </Link>
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
            href={`${driveFileDatum.link}`}
          >
            <StudentCard rowData={driveFileDatum} thumbnailSize={"big"} />
          </a>
        )}
      </div>
    </>
  )
}

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request)

  return null
}

// /**
//  * Loader Function
//  */
// export async function loader({ request, params }: LoaderArgs) {
//   await requireUserSession(request)

//   console.log("🚀 routes/$studentFolderId.$fileId.tsx ~ 	🙂 in loader")
//   const studentFolderId = params.studentFolderId
//   const fileId = params.fileId

//   invariant(studentFolderId, "studentFolder in params is required")
//   invariant(fileId, "fileId in params is required")

//   let user
//   try {
//     user = await getUserWithCredential(request)
//     const drive = await getDrive(user.Credential.accessToken)

//     if (!drive) {
//       throw json(
//         { errorMessage: "Unauthorized Google Account" },
//         {
//           status: 500,
//         }
//       )
//     }

//     // call drive
//     const permissions = await callPermissions(drive, fileId)
//     console.log(
//       "🚀 routes/$studentFolderId.$fileId.tsx ~ 	🌈 permissions ✨ ",
//       permissions
//     )
//     if (permissions.length === 0) {
//       throw errorResponse(`You have no permissions!`, 403)
//     }

//     return {
//       permissions,
//     }
//   } catch (error) {
//     console.error(
//       "🚀 routes/$studentFolderId.$fileId.tsx ~ 	🙂 in Error of studentFolderId.$fileId.tsx",
//       error
//     )
//     throw json(
//       { errorMessage: "Something went wrong!!" },
//       {
//         status: 403,
//       }
//     )
//   }
// }

/**
 * call Permissions API
 */
// export async function callPermissions(drive: drive_v3.Drive, fileId: string) {
//   console.log("🚀 routes/$studentFolderId.$fileId.tsx ~ 	🙂 in callPermmissions")
//   const fields = "permissions(id,type,emailAddress,role,displayName)"

//   try {
//     const list = await drive.permissions.list({
//       fileId,
//       fields,
//     })
//     const permissions = list.data.permissions as Permission[]

//     return permissions
//   } catch (error) {
//     console.error(error)
//     return []
//   }
// }

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
