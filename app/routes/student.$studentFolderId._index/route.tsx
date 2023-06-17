//-------------------------------------------
// student.$studentFolderId._index.tsx
// Index
//-------------------------------------------

import { Link, useRouteLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"

import { LeftArrow } from "~/components/icons"
import type { loader as studentFolderIdLoader } from "../student.$studentFolderId/route"
import StudentCards from "./StudentCards"

/**
 * StudentFolderIndexPage Component
 */
export default function StudentFolderIdIndexPage() {
  const { driveFileData, segments, extensions } = useRouteLoaderData(
    "routes/student.$studentFolderId"
  ) as Awaited<ReturnType<typeof studentFolderIdLoader>>

  // filteredFiles : filtered driveFileData
  const [filteredFiles, setFilteredFiles] = useState(() => driveFileData)

  // value of the clicked segment ex. リフレクション
  const [segment, setSegment] = useState("")
  // value of the clicked file extension ex. pdf
  const [extension, setExtension] = useState("")

  // TODO: Need to integrate multiple useEffects
  // filter for segments (keywords in filename)
  useEffect(() => {
    function filterSegments(segment: string) {
      const filtered = driveFileData?.filter((f) => {
        const currentSegments = f.name.split(/[-_.]/)
        return currentSegments.includes(segment)
      })

      // check if no filtered results or no segment clicked
      if (!filtered || !segment) return setFilteredFiles(driveFileData)
      setFilteredFiles(filtered)
    }
    filterSegments(segment)
  }, [segment, driveFileData])

  // filter for file extensions
  useEffect(() => {
    function filterExtensions(ext: string) {
      const filtered = driveFileData?.filter((f) => {
        const currentExt = f.mimeType.split(/[/.]/).at(-1)
        return currentExt === ext
      })
      if (!filtered || !extension) return setFilteredFiles(driveFileData)
      setFilteredFiles(filtered)
    }
    filterExtensions(extension)
  }, [extension, driveFileData])

  const textSize = `text-xs sm:text-sm`

  // JSX -------------------------
  return (
    <>
      <div className="flex gap-4">
        <Link to="/" className="shadow-md btn-success btn hover:bg-sfgreen-400">
          <LeftArrow className="w-5 h-5 mr-2" />
          Back
        </Link>
      </div>

      {/* segments of filenames split by "-","_" and "." */}
      <div className="mt-4">
        <div className={`flex flex-wrap`}>
          <span
            onClick={() => setFilteredFiles(driveFileData)}
            key="ALL"
            className={`btn-error btn-xs btn m-1 ${textSize}`}
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
                  className={`btn-success btn-xs btn m-1 ${textSize}`}
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
                  className={`btn-warning btn-xs btn m-1 ${textSize}`}
                >
                  {segment}
                </span>
              ))}
        </div>
      </div>

      <div className="mt-4 mb-12 overflow-x-auto ">
        {filteredFiles && <StudentCards driveFileData={filteredFiles} />}
      </div>
    </>
  )
}
