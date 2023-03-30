import { Link } from "@remix-run/react"

export default function StudentNameLink({
  studentData,
  link,
}: {
  studentData: any
  link: string
}) {
  return (
    <Link to={link} className='flex flex-col items-start'>
      <h2 className='card-title'>
        <span className='text-base font-normal'>
          {studentData.gakunen}
          {studentData.hr}
          {studentData.hrNo}
        </span>
        {studentData.last}
        {studentData.first}
      </h2>
      <p className='text-xs'>
        {studentData.sei} {studentData.mei}
      </p>
    </Link>
  )
}
