import Spinner from "~/components/icons/Spinner"
import StudentNameLink from "~/components/student/StudentNameLink"
import { getFolderId } from "~/lib/utils"
import type { StudentData } from "~/types"

// Sidebar
export default function Sidebar({
  studentData,
  drawerRef,
}: {
  studentData: StudentData[]
  drawerRef: React.RefObject<HTMLInputElement>
}) {
  function close() {
    if (drawerRef.current) {
      drawerRef.current.checked = false
    }
  }
  return (
    <div id="__Sidebar" className="rounded-md shadow-md drawer-side">
      <label htmlFor="my-drawer" className="drawer-overlay" />
      {studentData ? (
        <ul className="menu w-[240px] items-start bg-sfgreen-200 p-2 pt-20 sm:pt-10 text-base-content">
          {studentData.length === 0 && (
            <li className="flex flex-col items-center justify-center h-full">
              <h1 className="mx-auto text-3xl font-bold">No Data</h1>
            </li>
          )}
          {studentData.map((d: any) => (
            <li key={d.gakuseki} onClick={close}>
              {d.folderLink ? (
                <StudentNameLink
                  studentData={d}
                  link={`/student/${getFolderId(d.folderLink)}`}
                />
              ) : (
                <StudentNameLink studentData={d} link={`/student`} />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <Spinner />
        </div>
      )}
    </div>
  )
}
