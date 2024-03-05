import type { LoaderFunctionArgs } from "@remix-run/node"
import { json, useLoaderData } from "@remix-run/react"
import { NavLinkButton } from "~/components/buttons/button"
import { DriveLogoIcon, LogoIcon, LogoTextIcon } from "~/components/icons"
import { CACHE_MAX_AGE_SECONDS } from "~/config"
import { getSession } from "~/lib/services/session.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers()
  headers.set("Cache-Control", `private, max-age=${CACHE_MAX_AGE_SECONDS}`) // 10 minutes
  const { email, role, picture, folderId } = await getSession(request)

  if (!email) {
    return { role: null, picture: null, email: null, folderId: null }
  }

  return json(
    {
      role,
      picture,
      email,
      folderId,
    },
    { headers },
  )
}

export default function Index() {
  const { folderId, email } = useLoaderData<typeof loader>()

  return (
    <>
      <section className="flex flex-col items-center justify-center w-screen h-full gap-8 mx-auto max-w-7xl">
        <div className="flex items-center">
          <LogoIcon className="w-16 sm:w-24" />
          <LogoTextIcon className="w-40 sm:w-48" />
        </div>

        <div className="max-w-xl p-4 rounded-lg bg-slate-50">
          <WhatIsSchoolHub />
          <Explanation />
        </div>

        <LoginButton
          email={email ? email : undefined}
          folderId={folderId ? folderId : undefined}
        />
      </section>
    </>
  )
}

function LoginButton({
  email,
  folderId,
}: {
  email?: string | null
  folderId?: string | null
}) {
  return (
    <>
      <div className="relative flex items-center justify-center w-full gap-8 ">
        {!email || !folderId ? (
          <NavLinkButton to="/auth/signin" size="md">
            <LogoIcon className="w-4 h-7" />
            <span id="signin" className="ml-2 sm:ml-4 sm:inline">
              SCHOOL HUB サインイン
            </span>
          </NavLinkButton>
        ) : (
          <>
            <div className="flex flex-col gap-4 mt-8">
              <h3 className="text-xl ">Hello, </h3>
              <h2 className="text-2xl font-bold text-sfblue-400">{email}</h2>
              <NavLinkButton
                className="mt-4"
                to={`/student/${folderId}`}
                size="md"
              >
                <LogoIcon className="w-4 h-7" />
                <DriveLogoIcon className="w-4 h-4" />
                フォルダへ
              </NavLinkButton>
            </div>
          </>
        )}
      </div>
    </>
  )
}

function WhatIsSchoolHub() {
  return (
    <h2 className="text-xl font-semibold">
      ✨ What is{" "}
      <span className="underline text-bold text-sfblue-400 decoration-sfred-200 decoration-4">
        <LogoIcon className="inline w-4 h-4" />
        SCHOOL HUB STUDENT
      </span>
      ?
    </h2>
  )
}

function Explanation() {
  return (
    <p className="mt-2 text-normal ">
      <span className="px-1 underline rounded-md text-bold text-sfblue-300 decoration-sfred-200 decoration-2">
        <LogoIcon className="inline w-3 h-3" />
        SCHOOL HUB STUDENT
      </span>
      とは生徒の
      <span className="underline decoration-sfred-200 decoration-2">
        <DriveLogoIcon className="inline w-3 h-3" />
        Google Drive
      </span>{" "}
      と連携するアプリです。
    </p>
  )
}
