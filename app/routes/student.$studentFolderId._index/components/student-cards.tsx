import { Link, useParams } from "@remix-run/react"
import StudentCard from "./student-card"
import type { DriveFileData } from "~/types"
import { DriveFileDatasSchema } from "~/types/schemas"

export default function StudentCards({
  driveFiles,
  isNavigating = false,
}: {
  driveFiles: DriveFileData[]
  isNavigating?: boolean
}) {
  const { studentFolderId } = useParams()

  const result = DriveFileDatasSchema.safeParse(driveFiles)

  if (!result.success) {
    throw new Error(result.error.message)
  }

  const dfdz = result.data

  return (
    <div
      data-name="StudentCards"
      className="grid grid-cols-1 gap-4 pt-4 outline-sfgreen-200 md:grid-cols-2 xl:grid-cols-3"
    >
      {dfdz &&
        dfdz.map((d: DriveFileData) => (
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
