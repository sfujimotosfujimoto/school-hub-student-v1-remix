import { Link, useRouteLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"

import LeftArrow from "~/components/icons/LeftArrow"
import StudentCards from "~/components/student.$studentFolderId/StudentCards"
import type { loader as studentFolderIdLoader } from "./student.$studentFolderId"

export default function StudentFolderPage() {
  const { driveFileData, segments, extensions } = useRouteLoaderData(
    "routes/student.$studentFolderId"
  ) as Awaited<ReturnType<typeof studentFolderIdLoader>>

  const [filteredFiles, setFilteredFiles] = useState(driveFileData)

  const [segment, setSegment] = useState("")
  const [extension, setExtension] = useState("")

  useEffect(() => {
    function filterSegments(segment: string) {
      const filtered = driveFileData?.filter((f) => {
        const currentSegments = f.name.split(/[\_\-\.]/)
        return currentSegments.includes(segment)
      })

      if (!filtered || !segment) return driveFileData
      setFilteredFiles(filtered)
    }
    filterSegments(segment)
  }, [segment, driveFileData])

  useEffect(() => {
    function filterExtensions(ext: string) {
      const filtered = driveFileData?.filter((f) => {
        const currentExt = f.mimeType.split(/[/.]/).at(-1)
        return currentExt === ext
      })
      if (!filtered || !extension) return driveFileData
      setFilteredFiles(filtered)
    }
    filterExtensions(extension)
  }, [extension, driveFileData])

  return (
    <>
      <div className="flex gap-4">
        <Link
          to="/student"
          className="btn-success btn shadow-md hover:bg-sfgreen-400"
        >
          <LeftArrow className="mr-2 h-5 w-5" />
          Back
        </Link>
      </div>

      {/* segments of filenames split by "-","_" and "." */}
      <div className={`flex flex-wrap`}>
        <span
          onClick={() => setFilteredFiles(driveFileData)}
          key="ALL"
          className={`btn-error btn-xs btn m-1 text-sm`}
        >
          ALL
        </span>
        {extensions &&
          Array.from(extensions.values())
            .sort()
            .map((segment, idx) => (
              <span
                onClick={() => setExtension(segment)}
                key={idx}
                className={`btn-success btn-xs btn m-1 text-sm`}
              >
                {segment}
              </span>
            ))}
        {segments &&
          Array.from(segments.values())
            .sort()
            .map((segment, idx) => (
              <span
                onClick={() => setSegment(segment)}
                key={idx}
                className={`btn-warning btn-xs btn m-1 text-sm`}
              >
                {segment}
              </span>
            ))}
      </div>

      <div className="mb-12 mt-4 overflow-x-auto ">
        {filteredFiles && <StudentCards driveFileData={filteredFiles} />}
      </div>
    </>
  )
}
