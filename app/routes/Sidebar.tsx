import StudentNameLink from "~/components/_student/StudentNameLink"
import Spinner from "~/components/icons/Spinner"
import type { StudentData } from "~/types"

function getFolderId(folderUrl: string): string | null {
  if (!folderUrl) return null
  const output = String(folderUrl).split("/").at(-1)
  if (!output) return null
  return output
}

export default function Sidebar({
  studentData,
}: {
  studentData: StudentData[]
}) {
  return (
    <div className='drawer-side rounded-md shadow-md'>
      <label htmlFor='my-drawer' className='drawer-overlay' />
      {studentData ? (
        <ul className='menu w-[240px] items-start bg-sfgreen-200 p-2 pt-10 text-base-content'>
          {studentData.map((d: any) => (
            <li key={d.gakuseki}>
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
