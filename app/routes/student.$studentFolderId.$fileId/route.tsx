import { type LoaderArgs, type V2_MetaFunction } from "@remix-run/node"
import { useParams, useRouteLoaderData } from "@remix-run/react"

import StudentCard from "~/routes/student.$studentFolderId._index/StudentCard"

import type { loader as studentFolderIdLoader } from "../student.$studentFolderId/route"
import ToFolderBtn from "./ToFolderBtn"
import BackButton from "~/components/BackButton"
import * as userS from "~/lib/user.server"

/**
 * StudentFolderFileIdPage
 */
export default function StudentFolderIdFileIdPage() {
  const { studentFolderId, fileId } = useParams()
  const { driveFileData } = useRouteLoaderData(
    "routes/student.$studentFolderId"
  ) as Awaited<ReturnType<typeof studentFolderIdLoader>>

  // find driveFileDatum from driveFileData[]
  const driveFileDatum = driveFileData?.find((r) => r.id === fileId)

  // JSX -------------------------
  return (
    <>
      {/* Buttons */}
      <div className="flex items-center gap-4">
        <BackButton to={`/student/${studentFolderId}`} />

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
            <StudentCard
              driveFileDatum={driveFileDatum}
              thumbnailSize={"big"}
            />
          </a>
        )}
      </div>
    </>
  )
}

export async function loader({ request }: LoaderArgs) {
  await userS.requireUserRole(request)

  return null
}

/**
 * Meta Function
 */
export const meta: V2_MetaFunction = () => {
  // const title =
  //   `${data?.student.gakunen}${data?.student.hr}${data?.student.hrNo}${data?.student.last}${data?.student.first}` ||
  //   ""

  return [
    {
      title: `SCHOOL HUB`,
    },
  ]
}
