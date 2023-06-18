import { useRouteLoaderData } from "@remix-run/react"

import type { loader as studentFolderIdLoader } from "../student.$studentFolderId/route"
import StudentCards from "./StudentCards"
import BackButton from "~/components/BackButton"
import React from "react"
import type { LoaderArgs } from "@remix-run/node"
import * as userS from "~/lib/user.server"

/**
 * StudentFolderIndexPage Component
 */
export default function StudentFolderIdIndexPage() {
  const { driveFileData, segments, extensions } = useRouteLoaderData(
    "routes/student.$studentFolderId"
  ) as Awaited<ReturnType<typeof studentFolderIdLoader>>

  // filteredFiles : filtered driveFileData
  const [filteredFiles, setFilteredFiles] = React.useState(() => driveFileData)

  // value of the clicked segment ex. リフレクション
  const [segment, setSegment] = React.useState("")
  // value of the clicked file extension ex. pdf
  const [extension, setExtension] = React.useState("")

  // TODO: Need to integrate multiple useEffects
  // filter for segments (keywords in filename)
  React.useEffect(() => {
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
  React.useEffect(() => {
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
        <BackButton to="/" />
      </div>

      {/* segments of filenames split by "-","_" and "." */}
      <div className="mt-4">
        <div className={`flex flex-wrap`}>
          <Segment
            text="ALL"
            textSize={textSize}
            btnType="btn-error"
            onClickFn={() => setFilteredFiles(driveFileData)}
          />
          {extensions &&
            Array.from(extensions.values())
              .sort()
              .map((segment, idx) => (
                <Segment
                  key={idx}
                  text={segment}
                  textSize={textSize}
                  btnType="btn-success"
                  onClickFn={() => setExtension(segment)}
                />
              ))}
          {segments &&
            Array.from(segments.values())
              .sort()
              .map((segment, idx) => (
                <Segment
                  key={idx}
                  text={segment}
                  textSize={textSize}
                  btnType="btn-warning"
                  onClickFn={() => setSegment(segment)}
                />
              ))}
        </div>
      </div>

      <div className="mt-4 mb-12 overflow-x-auto ">
        {filteredFiles && <StudentCards driveFileData={filteredFiles} />}
      </div>
    </>
  )
}

function Segment({
  text,
  btnType,
  textSize,
  onClickFn,
}: {
  text: string
  btnType: "btn-error" | "btn-warning" | "btn-success"
  textSize: string
  onClickFn: React.MouseEventHandler<HTMLSpanElement>
}) {
  return (
    <span
      onClick={onClickFn}
      className={`${btnType} btn-xs btn m-1 ${textSize}`}
    >
      {text}
    </span>
  )
}

export async function loader({ request }: LoaderArgs) {
  await userS.requireUserRole(request)

  return null
}
