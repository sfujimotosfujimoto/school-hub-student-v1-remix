import { useLoaderData, useParams, useRouteLoaderData } from "@remix-run/react"

import type { loader as parentLoader } from "../student.$studentFolderId/route"
import BackButton from "~/components/BackButton"
import FileCount from "./components/file-count"
import NendoPills from "./components/nendo-pills"
import TagPills from "./components/tag-pills"
import SegmentPills from "./components/segment-pills"
import StudentCards from "./StudentCards"
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { createQuery, getDriveFiles } from "~/lib/google/drive.server"
import { getUserFromSession } from "~/lib/services/session.server"
import { parseTags } from "~/lib/utils"
import ErrorBoundaryDocument from "~/components/error-boundary-document"
import AllPill from "./components/all-pill"
import ExtensionPills from "./components/extensions-pills"

/**
 * LOADER function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { studentFolderId } = params
  if (!studentFolderId) throw Error("id route parameter must be defined")

  const user = await getUserFromSession(request)

  const url = new URL(request.url)
  const nendoString = url.searchParams.get("nendo")
  const tagString = url.searchParams.get("tags")
  const segmentsString = url.searchParams.get("segments")
  const extensionsString = url.searchParams.get("extensions")

  // Get drive files for student folder
  const query =
    createQuery({
      folderId: studentFolderId,
    }) || ""

  const driveFiles = await getDriveFiles(
    user?.credential?.accessToken || "",
    query,
  )

  let filteredDriveFiles = driveFiles

  // filter by nendo
  if (nendoString) {
    filteredDriveFiles =
      filteredDriveFiles?.filter((df) => {
        if (df.appProperties?.nendo === nendoString) return true
        return false
      }) || []
  }

  // filter by tag
  if (tagString) {
    filteredDriveFiles =
      filteredDriveFiles?.filter((df) => {
        if (df.appProperties?.tags) {
          const tagsArr = parseTags(df.appProperties.tags)
          return tagsArr.includes(tagString || "")
        }
        return false
      }) || []
  }

  // filter by extensions
  if (extensionsString) {
    filteredDriveFiles =
      filteredDriveFiles?.filter((df) => {
        const ext = df.mimeType.split(/[/.]/).at(-1) || ""
        return ext === extensionsString
      }) || []
  }

  // filter by segments
  if (segmentsString) {
    filteredDriveFiles =
      filteredDriveFiles?.filter((df) => {
        const segments = df.name.split(/[-_.]/)
        return segments.includes(segmentsString)
      }) || []
  }

  const headers = new Headers()

  headers.set("Cache-Control", `private, max-age=${60 * 60}`) // 1 hour

  return json(
    {
      driveFiles: filteredDriveFiles,
      nendoString,
      tagString,
      url: request.url,
    },
    {
      headers,
    },
  )
}

/**
 * StudentFolderIndexPage Component
 */
export default function StudentFolderIdIndexPage() {
  const data = useRouteLoaderData<typeof parentLoader>(
    "routes/student2.$studentFolderId",
  )
  if (!data) throw Error("Could not load data")

  const { studentFolderId, nendos, tags, extensions, segments } = data
  const { driveFiles, url } = useLoaderData<typeof loader>()

  // JSX -------------------------
  return (
    <>
      <section className="flex h-full flex-col space-y-4">
        <div className="flex flex-none items-center justify-between">
          <BackButton />
          <FileCount driveFiles={driveFiles} />
        </div>
        <div className="flex flex-none flex-wrap gap-1">
          <AllPill url={url} studentFolderId={studentFolderId} />
          <div className="divider divider-horizontal mx-0"></div>
          <NendoPills url={url} nendos={nendos} />
          <div className="divider divider-horizontal mx-0"></div>
          <TagPills url={url} tags={tags} />
          <div className="divider divider-horizontal mx-0"></div>
          <ExtensionPills url={url} extensions={extensions} />
          <div className="divider divider-horizontal mx-0"></div>
          <SegmentPills url={url} segments={segments} />
        </div>

        {driveFiles && driveFiles.length ? (
          <div className="mb-12 mt-4 flex-auto overflow-x-auto px-2">
            {driveFiles && <StudentCards driveFiles={driveFiles} />}
          </div>
        ) : (
          <div className="flex flex-auto items-center justify-center">
            <h1 className="text-2xl font-bold">
              ファイルが見つかりませんでした。
            </h1>
          </div>
        )}
      </section>
    </>
  )
}

/**
 * Error Boundary
 */
export function ErrorBoundary() {
  const { studentFolderId } = useParams()
  let message = `フォルダID（${studentFolderId}）からフォルダを取得できませんでした。`
  return <ErrorBoundaryDocument message={message} />
}
