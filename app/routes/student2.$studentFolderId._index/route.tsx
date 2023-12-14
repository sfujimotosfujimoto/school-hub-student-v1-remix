import { useLoaderData, useParams, useRouteLoaderData } from "@remix-run/react"
import React from "react"

import type { loader as parentLoader } from "../student.$studentFolderId/route"
import BackButton from "~/components/BackButton"
import FileCount from "./components/file-count"
import NendoButtons from "./components/nendo-buttons"
import TagButtons from "./components/tag-buttons"
import Segments from "./components/segments"
import StudentCards from "./StudentCards"
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { createQuery, getDriveFiles } from "~/lib/google/drive.server"
import { getUserFromSession } from "~/lib/session.server"
import { parseTags } from "~/lib/utils"
import ErrorBoundaryDocument from "~/components/error-boundary-document"

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
  if (nendoString && nendoString !== "ALL") {
    filteredDriveFiles =
      driveFiles?.filter((df) => {
        if (df.appProperties?.nendo === nendoString) return true
        return false
      }) || []
  }

  // filter by tag
  if (tagString && tagString !== "ALL") {
    filteredDriveFiles =
      driveFiles?.filter((df) => {
        if (df.appProperties?.tags) {
          const tagsArr = parseTags(df.appProperties.tags)
          return tagsArr.includes(tagString || "")
        }
        return false
      }) || []
  }

  // filter by extensions
  if (extensionsString && extensionsString !== "ALL") {
    filteredDriveFiles =
      driveFiles?.filter((df) => {
        const ext = df.mimeType.split(/[/.]/).at(-1) || ""
        return ext === extensionsString
      }) || []
  }

  // filter by segments
  if (segmentsString && segmentsString !== "ALL") {
    filteredDriveFiles =
      driveFiles?.filter((df) => {
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
  const { driveFiles, nendoString, tagString, url } =
    useLoaderData<typeof loader>()

  // JSX -------------------------
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <BackButton to="/" />
        <FileCount driveFiles={driveFiles} />
      </div>
      <NendoButtons
        url={url}
        studentFolderId={studentFolderId}
        nendos={nendos}
        nendo={nendoString || ""}
        color={"bg-slate-400"}
      />
      <TagButtons
        url={url}
        tags={tags}
        tag={tagString || ""}
        color={"bg-slate-400"}
      />
      <Segments url={url} extensions={extensions} segments={segments} />
      <div className="mb-12 mt-4 overflow-x-auto px-2">
        {driveFiles && <StudentCards driveFiles={driveFiles} />}
      </div>
    </section>
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
