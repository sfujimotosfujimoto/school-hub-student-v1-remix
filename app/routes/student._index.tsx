import GakunenButtons from "~/components/student._index/GakunenButtons"
import HrButtons from "~/components/student._index/HrButtons"

import type { V2_MetaFunction } from "@remix-run/node"

import { useGakunen } from "./student"
import { useEffect } from "react"

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: `Students | SCHOOL HUB`,
    },
  ]
}

export default function StudentPage() {
  const { gakunen, setGakunen, hr, setHr, drawerRef } = useGakunen()

  useEffect(() => {
    if (hr !== "ALL" && drawerRef?.current) {
      drawerRef.current.checked = true
    }
  }, [hr, drawerRef])

  return (
    <div
      data-name="student._index"
      className="flex h-full flex-col items-center justify-center"
    >
      <div
        id="__border-wrapper"
        className="rounded-2xl border-2 border-sfgreen-400 p-10 shadow-lg"
      >
        <div
          id="__flex-wrapper"
          className="flex flex-col items-center justify-center gap-4"
        >
          <h1 className="text-base font-medium underline decoration-sfred-300 decoration-2 underline-offset-8 sm:text-xl">
            学年を選ぶ
          </h1>
          <GakunenButtons setGakunen={setGakunen} gakunen={gakunen} />
          <h1 className="text-base font-medium underline decoration-sfred-300 decoration-2 underline-offset-8 sm:text-xl">
            クラスを選ぶ
          </h1>
          <HrButtons setHr={setHr} hr={hr} />
        </div>
      </div>
    </div>
  )
}
