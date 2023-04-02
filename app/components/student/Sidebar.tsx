import Spinner from "~/components/icons/Spinner"
import StudentNameLink from "~/components/student/StudentNameLink"
import type { Gakunen, StudentData } from "~/types"

function getFolderId(folderUrl: string): string | null {
  if (!folderUrl) return null
  const output = String(folderUrl).split("/").at(-1)
  if (!output) return null
  return output
}

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
    <div id='__Sidebar' className='drawer-side rounded-md shadow-md'>
      <label htmlFor='my-drawer' className='drawer-overlay' />
      {studentData ? (
        <ul className='menu w-[240px] items-start bg-sfgreen-200 p-2 pt-20 sm:pt-10 text-base-content'>
          {studentData.length === 0 && (
            <li className='h-full flex flex-col justify-center items-center'>
              <h1 className='text-3xl font-bold mx-auto'>No Data</h1>
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
        <div className='flex h-full flex-col items-center justify-center'>
          <Spinner />
        </div>
      )}
    </div>
  )
}
