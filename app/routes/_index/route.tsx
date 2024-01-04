import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useRouteLoaderData } from "@remix-run/react"

import { logger } from "~/lib/logger"
import { getFolderId } from "~/lib/utils"
import { getUserFromSession } from "~/lib/services/session.server"

import { DriveLogoIcon, LogoIcon, LogoTextIcon } from "~/components/icons"
import { NavLinkButton } from "~/components/buttons/button"

import type { loader as rootLoader } from "~/root"

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
      email: user?.email || null,
    })
  } catch (error) {
    console.error(`_index.tsx: ${error}`)
    return null
  }
}

export default function Index() {
  const data = useRouteLoaderData<typeof rootLoader>("root")
  // throw Error("error!!!!!")

  if (!data) {
    throw Error("no data")
  }

  const { email, folderLink } = data

  let folderId
  if (folderLink) {
    folderId = getFolderId(folderLink)
  }
  console.log("✅ _index/route.tsx ~ 	😀 ")
  return (
    <>
      <section className="mx-auto flex h-full w-screen max-w-7xl flex-col items-center justify-center gap-8">
        <div className="flex items-center">
          <LogoIcon className=" w-16 sm:w-24" />
          <LogoTextIcon className="w-40 sm:w-48" />
        </div>

        <div className="max-w-xl rounded-lg bg-slate-50 p-4">
          <WhatIsSchoolHub />
          <Explanation />
        </div>

        <LoginButton email={email} folderId={folderId} />
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
      <div className="relative flex w-full items-center justify-center gap-8 ">
        {!email || !folderId ? (
          <NavLinkButton to="/auth/signin" size="md">
            <LogoIcon className="h-7 w-4" />
            <span id="signin" className="ml-2 sm:ml-4 sm:inline">
              SCHOOL HUB サインイン
            </span>
          </NavLinkButton>
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-4">
              <h3 className="text-xl ">Hello, </h3>
              <h2 className="text-2xl  font-bold text-sfblue-400">{email}</h2>
              <NavLinkButton
                className="mt-4"
                to={`/student/${folderId}`}
                size="md"
              >
                <LogoIcon className="h-7 w-4" />
                <DriveLogoIcon className="h-4 w-4" />
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
      <span className="text-bold text-sfblue-400 underline decoration-sfred-200 decoration-4">
        <LogoIcon className="inline h-4 w-4" />
        SCHOOL HUB STUDENT
      </span>
      ?
    </h2>
  )
}

function Explanation() {
  return (
    <p className="text-normal mt-2 ">
      <span className="text-bold rounded-md px-1 text-sfblue-300 underline decoration-sfred-200 decoration-2">
        <LogoIcon className="inline h-3 w-3" />
        SCHOOL HUB STUDENT
      </span>
      とは生徒の
      <span className="underline decoration-sfred-200 decoration-2">
        <DriveLogoIcon className="inline h-3 w-3" />
        Google Drive
      </span>{" "}
      と連携するアプリです。
    </p>
  )
}

/*

  return (
    <>
      <div className="relative flex w-full items-center justify-center gap-8 ">
        <Button>HELLO</Button>
        {!data?.role ? (
          <Form reloadDocument method="post" action="/auth/signin">
            <Button type="submit" variant="info" size="md">
              <Logo className="h-7 w-4" />
              <span className="ml-2 sm:ml-4 sm:inline">
                SCHOOL HUB サインイン
              </span>
            </Button>
          </Form>
        ) : (
          <Form method="post" action="/auth/signout">
            <Button type="submit" variant="secondary">
              <Logo className={`h-7 w-4 ${loading && "animate-spin"}`} />
              <span className="ml-1 sm:ml-2 sm:inline">
                SCHOOL HUB サインアウト
              </span>
            </Button>
          </Form>
        )}

        <div className="toast toast-end">
          {authstate === "expired" && (
            <Toast text="アクセス期限が切れました。" />
          )}
          {authstate === "unauthorized" && (
            <Toast text="アクセス権限がありません。" />
          )}
          {authstate === "no-login" && (
            <Toast text="ログインをしてください。" />
          )}
          {authstate === "not-parent-account" && (
            <Toast text="保護者・生徒Googleアカウントでログインをしてください。" />
          )}
          {authstate === "no-folder" && (
            <Toast text="Googleフォルダがないか、名簿のGoogleSheetが共有されていません。" />
          )}
        </div>
      </div>
    </>
  )

*/
