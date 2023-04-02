import GakunenButtons from "~/components/student._index/GakunenButtons"
import HrButtons from "~/components/student._index/HrButtons"

import type { V2_MetaFunction } from "@remix-run/node"

import { useGakunen } from "./student"

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: `Students | SCHOOL HUB`,
    },
  ]
}

export default function StudentPage() {
  const { gakunen, setGakunen, hr, setHr } = useGakunen()

  return (
    <div
      id='_student.student._index'
      className='rounded-2xl border-2 border-sfgreen-400 p-10 shadow-lg'
    >
      <div className='flex flex-col gap-4'>
        <h1 className='text-base font-medium underline decoration-sfred-300 decoration-2 underline-offset-8 sm:text-xl'>
          学年を選ぶ
        </h1>
        <GakunenButtons setGakunen={setGakunen} gakunen={gakunen} />
        <h1 className='text-base font-medium underline decoration-sfred-300 decoration-2 underline-offset-8 sm:text-xl'>
          クラスを選ぶ
        </h1>
        <HrButtons setHr={setHr} hr={hr} />
      </div>
    </div>
  )
}
