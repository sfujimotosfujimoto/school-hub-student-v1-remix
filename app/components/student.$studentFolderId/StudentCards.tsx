import { useParams } from "@remix-run/react"
import StudentCard from "./StudentCard"

export default function StudentCards({ rows }: { rows: any }) {
  const { studentFolderId } = useParams()
  return (
    <div
      id="_StudentCards"
      className="grid grid-cols-1 gap-4 pt-4 outline-sfgreen-200  xl:grid-cols-2"
    >
      {rows &&
        rows.map((d: any) => (
          <a
            key={d.id}
            id="_StudentCard"
            href={`/student/${studentFolderId}/${d.id}`}
          >
            <StudentCard rowData={d} />
          </a>
        ))}
    </div>
  )
}
