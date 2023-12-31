import { Link, useParams } from "@remix-run/react"
import type { DriveFileData } from "~/___types"
import StudentCard from "./student-card"
import type { SerializeFrom } from "@remix-run/node"

export default function StudentCards({
  driveFiles,
  isNavigating = false,
}: {
  driveFiles: SerializeFrom<DriveFileData[]>
  isNavigating?: boolean
}) {
  const { studentFolderId } = useParams()

  return (
    <div
      data-name="StudentCards"
      className="grid grid-cols-1 gap-4 pt-4 outline-sfgreen-200 md:grid-cols-2 xl:grid-cols-3"
    >
      {driveFiles &&
        driveFiles.map((d: DriveFileData) => (
          <Link
            prefetch="intent"
            key={d.fileId}
            id="_StudentCard"
            to={`/student/${studentFolderId}/${d.fileId}`}
          >
            <StudentCard
              driveFile={d}
              isViewed={d.views > 0}
              isNavigating={isNavigating}
            />
          </Link>
        ))}
    </div>
  )
}
