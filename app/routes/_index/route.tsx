import LoginButton from "./LoginButton"
import { DriveLogo, Logo, LogoText } from "~/components/icons"

export default function Index() {
  return (
    <main data-name="_index" className="flex justify-center">
      <div className="mx-auto flex h-screen w-screen max-w-7xl flex-col items-center justify-center gap-8">
        <LogoAndText />
        <div className="max-w-xl rounded-lg bg-base-100 p-4 shadow-lg">
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
      <Logo className="h-24 w-16 sm:h-32 sm:w-32" />
      <LogoText className="h-24 w-52 sm:h-40 sm:w-72" />
    </div>
  )
}

function WhatIsSchoolHub() {
  return (
    <h2 className="text-xl font-semibold">
      ✨ What is{" "}
      <span className="text-bold inline-block rounded-md bg-sfred-50 p-[2px] px-1 text-indigo-900">
        <Logo className="inline h-4 w-4" />
        SCHOOL HUB FOR STUDENTS
      </span>
      ?
    </h2>
  )
}

function Explanation() {
  return (
    <p className="text-normal mt-2 text-base-content ">
      <span className="text-bold rounded-md px-1 text-indigo-900 underline decoration-sfred-200 decoration-2">
        <Logo className="inline h-3 w-3" />
        SCHOOL HUB FOR STUDENTS
      </span>
      とは
      <span className="underline decoration-sfred-200 decoration-2">
        <DriveLogo className="inline h-3 w-3" />
        Google Drive
      </span>{" "}
      と連携するアプリです。
    </p>
  )
}
