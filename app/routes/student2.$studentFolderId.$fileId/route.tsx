import {
  isRouteErrorResponse,
  useParams,
  useRouteError,
  useRouteLoaderData,
} from "@remix-run/react"

import type { loader as studentFolderIdLoader } from "../student.$studentFolderId/route"
import ToFolderBtn from "./ToFolderBtn"
import BackButton from "~/components/BackButton"
import {
  redirect,
  type MetaFunction,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node"
import { logger } from "~/lib/logger"
import { requireUserRole } from "~/lib/require-roles.server"
import React from "react"
import StudentCard from "../student.$studentFolderId._index/StudentCard"
import type { DriveFile } from "~/types"
import { getUserFromSession } from "~/lib/session.server"

/**
 * StudentFolderFileIdPage
 */
export default function StudentFolderIdFileIdPage() {
  console.log("✅ student.$studentFolderId.$fileId/route.tsx ~ 	😀")
  const { studentFolderId, fileId } = useParams()
  const props = useRouteLoaderData<typeof studentFolderIdLoader>(
    "routes/student.$studentFolderId",
  )

  if (!props) {
    console.error(`🚨 `)
    throw new Error("no props")
  }

  const { driveFiles } = props

  const dfs = React.useMemo(() => {
    return driveFiles
  }, [driveFiles])

  // find driveFileDatum from driveFileData[]
  const driveFile: DriveFile | undefined = dfs?.find((r) => r.id === fileId)

  // JSX -------------------------
  return (
    <>
      {/* Buttons */}
      <div className="flex items-center gap-4">
        <BackButton to={`/student/${studentFolderId}`} />

        {driveFile && driveFile.parents && (
          <ToFolderBtn parentId={driveFile.parents[0]} />
        )}
      </div>

      {/* Student file card */}
      <div className="mt-4">
        {driveFile && (
          <a
            id="_StudentCard"
            target="_blank"
            rel="noopener noreferrer"
            href={`${driveFile.link}`}
          >
            <StudentCard driveFile={driveFile} thumbnailSize={"big"} />
          </a>
        )}
      </div>
    </>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: student.$studentFolderId.$fileId ${request.url}`)
  const user = await getUserFromSession(request)
  if (!user) throw redirect("/?authstate=unauthorized")
  await requireUserRole(user)

  return json(null, {
    headers: {
      "Cache-Control": "max-age=300",
    },
  })
}

/**
 * Meta Function
 */
export const meta: MetaFunction = () => {
  // const title =
  //   `${data?.student.gakunen}${data?.student.hr}${data?.student.hrNo}${data?.student.last}${data?.student.first}` ||
  //   ""

  return [
    {
      title: `SCHOOL HUB`,
    },
  ]
}

export function ErrorBoundary() {
  const error = useRouteError()
  const { id } = useParams()
  let heading = "Something went wrong"
  let message = `Apologies, something went wrong on our end,
  please try again.`
  if (isRouteErrorResponse(error) && error.status === 404) {
    heading = "Expense not found"
    message = `Apologies, the expense with the id ${id} cannot
  be found.`
  }
  return (
    <>
      <div
        className="m-auto flex w-full flex-col items-center
  justify-center gap-5 lg:max-w-3xl"
      >
        <h2>{heading}</h2>
        <p>{message}</p>
      </div>
      <BackButton to="/" />
    </>
  )
}
