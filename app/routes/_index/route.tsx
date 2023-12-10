import { json, type LoaderFunctionArgs } from "@remix-run/node"
import LoginButton from "./LoginButton"
import { DriveLogo, Logo, LogoText } from "~/components/icons"
import { logger } from "~/lib/logger"
import { getUserFromSession } from "~/lib/session.server"

/**
 * Root loader
 */
export async function loader({ request }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: _index ${request.url}`)
  // throw Error("error!!!!!")
  try {
    const user = await getUserFromSession(request)

    return json({
      role: user?.role || null,
      picture: user?.picture || null,
    })
  } catch (error) {
    console.error(`_index.tsx: ${error}`)
    return null
  }
}

export default function Index() {
  // throw Error("error!!!!!")
  console.log("✅ _index/route.tsx ~ 	😀 ")
  return (
    <section className="mx-auto flex h-full w-screen max-w-7xl flex-col items-center justify-center gap-8">
      <div className="flex items-center">
        <Logo className="h-12 w-12 sm:h-32 sm:w-32" />
        <LogoText className="h-12 w-32 sm:h-32 sm:w-72" />
      </div>
      <div className="max-w-xl rounded-lg bg-base-100 p-4 shadow-lg">
        <WhatIsSchoolHub />
        <Explanation />
      </div>
      <LoginButton />
    </section>
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
