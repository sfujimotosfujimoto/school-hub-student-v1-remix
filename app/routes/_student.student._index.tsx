import GakunenButtons from "../components/_student.student._index/GakunenButtons"

export default function StudentPage() {
  return (
    <div className='rounded-2xl border-2 border-sfgreen-400 p-10 shadow-lg'>
      <h1 className='text-base font-medium underline decoration-sfred-300 decoration-2 underline-offset-8 sm:text-xl'>
        学年を選ぶ
      </h1>
      <GakunenButtons />
    </div>
  )
}
