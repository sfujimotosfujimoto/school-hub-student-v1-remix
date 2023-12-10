import { useRouteLoaderData } from "@remix-run/react"
import StudentCards from "./StudentCards"
import BackButton from "~/components/BackButton"
import React from "react"

import { useDriveFilesContext } from "~/context/drive-files-context"
import FileCount from "./components/file-count"
import NendoButtons from "./components/nendo-buttons"
import TagButtons from "./components/tag-buttons"
import Segments from "./components/segments"
import type { DriveFile, Student } from "~/types"
import type { Role } from "@prisma/client"

/**
 * StudentFolderIndexPage Component
 */
export default function StudentFolderIdIndexPage() {
  const { driveFiles, segments, extensions, nendos, tags } = useRouteLoaderData(
    "routes/student.$studentFolderId",
  ) as unknown as {
    extensions: string[]
    segments: string[]
    driveFiles: DriveFile[] | null
    student: Student | null
    role: Role
    nendos: string[]
    tags: string[]
  }

  const { driveFiles: _driveFiles, driveFilesDispatch } = useDriveFilesContext()

  React.useEffect(() => {
    if (!driveFiles) return
    driveFilesDispatch({ type: "SET", payload: { driveFiles } })
  }, [driveFiles, driveFilesDispatch])

  let baseDriveFiles = React.useMemo(() => {
    if (!driveFiles) return []
    return driveFiles
  }, [driveFiles])

  // JSX -------------------------
  return (
    <section className="space-y-4">
      <BackButton to="/" />

      <FileCount />

      <NendoButtons
        baseDriveFiles={baseDriveFiles}
        nendos={nendos}
        color={"bg-slate-400"}
        showAll={true}
      />

      <TagButtons
        baseDriveFiles={baseDriveFiles}
        tags={tags}
        color={"bg-slate-400"}
      />

      {/* SEGMENTS */}
      <Segments
        extensions={extensions}
        segments={segments}
        baseDriveFiles={baseDriveFiles}
      />

      {/* STUDENTCARDS */}
      <div className="mb-12 mt-4 overflow-x-auto px-2">
        <StudentCards driveFiles={_driveFiles} />
      </div>
    </section>
  )
}
