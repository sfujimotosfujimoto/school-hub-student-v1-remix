import { Link, useParams } from "@remix-run/react"
import type { DriveFileData } from "~/types"
import StudentCard from "./StudentCard"

export default function StudentCards({
  driveFileData,
}: {
  driveFileData: DriveFileData[]
}) {
  const { studentFolderId } = useParams()
  return (
    <div
      id="_StudentCards"
      className="grid grid-cols-1 gap-4 pt-4 outline-sfgreen-200 md:grid-cols-2 xl:grid-cols-3"
    >
      {driveFileData &&
        driveFileData.map((d: DriveFileData) => (
          <Link
            key={d.id}
            id="_StudentCard"
            to={`/student/${studentFolderId}/${d.id}`}
          >
            <StudentCard rowData={d} />
          </Link>
        ))}
    </div>
  )
}
