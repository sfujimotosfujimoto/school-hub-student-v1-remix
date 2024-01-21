import { useRouteLoaderData } from "@remix-run/react"
import { NavLinkButton } from "~/components/buttons/button"
import { DriveLogoIcon, LogoIcon, LogoTextIcon } from "~/components/icons"
import { getFolderId } from "~/lib/utils"
import type { loader as rootLoader } from "~/root"

/**
 * Root loader
 */
// export async function loader({ request }: LoaderFunctionArgs) {
//   logger.debug(`🍿 loader: _index ${request.url}`)
//   // throw Error("error!!!!!")
//   try {
//     const user = await getUserFromSession(request)

//     return json({
//       role: user?.role || null,
//       picture: user?.picture || null,
//       email: user?.email || null,
//     })
//   } catch (error) {
//     console.error(`_index.tsx: ${error}`)
//     return null
//   }
// }

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

/*

  return (
    <>
      <div className="relative flex items-center justify-center w-full gap-8 ">
        <Button>HELLO</Button>
        {!data?.role ? (
          <Form reloadDocument method="post" action="/auth/signin">
            <Button type="submit" variant="info" size="md">
              <Logo className="w-4 h-7" />
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
