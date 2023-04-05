import { Link, useRouteLoaderData } from "@remix-run/react"

import LeftArrow from "~/components/icons/LeftArrow"
import StudentCards from "~/components/student.$studentFolderId/StudentCards"
import type { RowType, StudentData } from "~/types"

export default function StudentFolderPage() {
  const { rows } = useRouteLoaderData(
    "routes/student.$studentFolderId"
  ) as ReturnType<() => { rows: RowType[]; student: StudentData }>

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

      <div className="mb-12 mt-4 overflow-x-auto ">
        <StudentCards rows={rows} />
      </div>
    </>
  )
}
