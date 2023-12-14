import { Link, useParams } from "@remix-run/react"
import type { DriveFile } from "~/types"
import StudentCard from "./StudentCard"

export default function StudentCards({
  driveFiles,
}: {
  driveFiles: DriveFile[]
}) {
  const { studentFolderId } = useParams()

  return (
    <div
      data-name="StudentCards"
      className="grid grid-cols-1 gap-4 pt-4 outline-sfgreen-200 md:grid-cols-2 xl:grid-cols-3"
    >
      {driveFiles &&
        driveFiles.map((d: DriveFile) => (
          <Link
            prefetch="intent"
            key={d.id}
            id="_StudentCard"
            to={`/student2/${studentFolderId}/${d.id}`}
          >
            <StudentCard driveFile={d} />
          </Link>
        ))}
    </div>
  )
}
