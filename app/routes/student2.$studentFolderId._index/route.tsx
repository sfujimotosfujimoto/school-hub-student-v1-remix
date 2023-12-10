import { useLoaderData, useRouteLoaderData } from "@remix-run/react"
import React from "react"

import type { loader as parentLoader } from "../student.$studentFolderId/route"
import BackButton from "~/components/BackButton"
import FileCount from "./components/file-count"
import NendoButtons from "./components/nendo-buttons"
// import TagButtons from "./components/tag-buttons"
// import Segments from "./components/segments"
import StudentCards from "./StudentCards"
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { createQuery, getDriveFiles } from "~/lib/google/drive.server"
import { getUserFromSession } from "~/lib/session.server"

/**
 * LOADER function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { studentFolderId } = params
  if (!studentFolderId) throw Error("id route parameter must be defined")

  const user = await getUserFromSession(request)

  const url = new URL(request.url)
  const nendoString = url.searchParams.get("nendo")

  const queryString =
    nendoString === "ALL" || !nendoString
      ? ""
      : `appProperties has { key='nendo' and value='${nendoString}' }`

  const query =
    createQuery({
      folderId: studentFolderId,
      query: queryString,
    }) || ""

  console.log("✅ student2.$studentFolderId._index/route.tsx ~ 😀 query", query)
  const driveFiles = await getDriveFiles(
    user?.credential?.accessToken || "",
    query,
  )
  const headers = new Headers()

  headers.set("Cache-Control", `private, max-age=${60 * 60}`) // 1 hour

  return json(
    {
      driveFiles,
      nendoString,
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

  const { studentFolderId, nendos } = data
  const { driveFiles, nendoString } = useLoaderData<typeof loader>()

  console.log("✅ student2.$studentFolderId._index/route.tsx ~ 	😀 ", driveFiles)

  // JSX -------------------------
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <BackButton to="/" />
        <FileCount driveFiles={driveFiles} />
      </div>
      <NendoButtons
        studentFolderId={studentFolderId}
        driveFiles={driveFiles || []}
        nendos={nendos}
        nendo={nendoString || ""}
        color={"bg-slate-400"}
        showAll={true}
      />
      {/* 
      <TagButtons
        baseDriveFiles={baseDriveFiles}
        tags={tags}
        color={"bg-slate-400"}
      />
      <Segments
        extensions={extensions}
        segments={segments}
        baseDriveFiles={baseDriveFiles}
      />
      */}
      <div className="mb-12 mt-4 overflow-x-auto px-2">
        {driveFiles && <StudentCards driveFiles={driveFiles} />}
      </div>
    </section>
  )
}
