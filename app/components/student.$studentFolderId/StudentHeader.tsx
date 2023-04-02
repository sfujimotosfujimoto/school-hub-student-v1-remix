import type { StudentData } from "~/types"

export default function StudentHeader({ student }: { student: StudentData }) {
  return (
    <>
      <h1 className='text-4xl font-semibold underline decoration-sfred-400 underline-offset-4'>
        {student.hr}
        {student.hrNo}
        {student.last}
        {student.first}
      </h1>
    </>
  )
}
