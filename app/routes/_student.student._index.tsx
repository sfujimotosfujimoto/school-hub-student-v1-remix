import type { V2_MetaFunction } from "@remix-run/node"

import GakunenButtons from "../components/_student.student._index/GakunenButtons"

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: `Students | SCHOOL HUB`,
    },
  ]
}

// export const meta: V2_MetaFunction = ({ matches }) => {
//   let parentMeta = matches.map((match) => match.meta[0] ?? [])
//   return [...parentMeta, { title: "Projects" }]
// }

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
