import { Link, useParams } from "@remix-run/react"
import StudentCard from "./student-card"
import type { DriveFile } from "~/types"
import { DriveFilesSchema } from "~/types/schemas"

export default function StudentCards({
  driveFiles,
  isNavigating = false,
}: {
  driveFiles: DriveFile[]
  isNavigating?: boolean
}) {
  const { studentFolderId } = useParams()

  const result = DriveFilesSchema.safeParse(driveFiles)

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
        dfdz.map((d: DriveFile) => (
          <Link
            prefetch="intent"
            key={d.id}
            id="_StudentCard"
            to={`/student/${studentFolderId}/${d.id}`}
          >
            <StudentCard driveFile={d} isNavigating={isNavigating} />
          </Link>
        ))}
    </div>
  )
}
