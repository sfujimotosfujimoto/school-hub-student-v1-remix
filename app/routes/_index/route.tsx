import LoginButton from "./LoginButton"
import { DriveLogo, Logo, LogoText } from "~/components/icons"

export default function Index() {
  return (
    <main data-name="_index" className="flex justify-center">
      <div className="flex flex-col items-center justify-center w-screen h-screen gap-8 mx-auto max-w-7xl">
        <LogoAndText />
        <div className="max-w-xl p-4 rounded-lg shadow-lg bg-base-100">
          <WhatIsSchoolHub />
          <Explanation />
        </div>
        <LoginButton />
      </div>
    </main>
  )
}

function LogoAndText() {
  return (
    <div className="flex items-center">
      <Logo className="w-16 h-24 sm:h-32 sm:w-32" />
      <LogoText className="h-24 w-52 sm:h-40 sm:w-72" />
    </div>
  )
}

function WhatIsSchoolHub() {
  return (
    <h2 className="text-xl font-semibold">
      ✨ What is{" "}
      <span className="text-bold inline-block rounded-md bg-sfred-50 p-[2px] px-1 text-indigo-900">
        <Logo className="inline w-4 h-4" />
        SCHOOL HUB FOR STUDENTS
      </span>
      ?
    </h2>
  )
}

function Explanation() {
  return (
    <p className="mt-2 text-normal text-base-content ">
      <span className="px-1 text-indigo-900 underline rounded-md text-bold decoration-sfred-200 decoration-2">
        <Logo className="inline w-3 h-3" />
        SCHOOL HUB FOR STUDENTS
      </span>
      とは
      <span className="underline decoration-sfred-200 decoration-2">
        <DriveLogo className="inline w-3 h-3" />
        Google Drive
      </span>{" "}
      と連携するアプリです。
    </p>
  )
}
