import StudentCard from "./StudentCard"

export default function StudentCards({ rows }: { rows: any }) {
  return (
    <div className='grid grid-cols-1 gap-4 pt-4 outline-sfgreen-200  xl:grid-cols-2'>
      {rows && rows.map((d: any) => <StudentCard key={d.id} rowData={d} />)}
    </div>
  )
}
