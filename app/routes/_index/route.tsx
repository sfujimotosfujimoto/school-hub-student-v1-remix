import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { DriveLogo, Logo, LogoText } from "~/components/icons"
import { logger } from "~/lib/logger"
import { getUserFromSession } from "~/lib/session.server"
import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react"
import Toast from "~/components/util/Toast"
import { Button } from "~/components/buttons/button"

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
    <>
      <section className="mx-auto flex h-full w-screen max-w-7xl flex-col items-center justify-center gap-8">
        <div className="flex items-center">
          <Logo className=" w-16 sm:w-24" />
          <LogoText className="w-40 sm:w-48" />
        </div>

        <div className="max-w-xl rounded-lg bg-base-100 p-4 shadow-lg">
          <WhatIsSchoolHub />
          <Explanation />
        </div>

        <LoginButton />
      </section>
    </>
  )
}

function WhatIsSchoolHub() {
  return (
    <h2 className="text-xl font-semibold">
      ✨ What is{" "}
      <span className="text-bold inline-block rounded-md bg-sfred-50 p-[2px] px-1 text-sfblue-300">
        <Logo className="inline h-4 w-4" />
        SCHOOL HUB TEACHER
      </span>
      ?
    </h2>
  )
}

function Explanation() {
  return (
    <p className="text-normal mt-2 ">
      <span className="text-bold rounded-md px-1 text-sfblue-300 underline decoration-sfred-200 decoration-2">
        <Logo className="inline h-3 w-3" />
        SCHOOL HUB TEACHER
      </span>
      とは生徒の
      <span className="underline decoration-sfred-200 decoration-2">
        <DriveLogo className="inline h-3 w-3" />
        Google Drive
      </span>{" "}
      と連携するアプリです。
    </p>
  )
}

function LoginButton() {
  const data = useLoaderData<typeof loader>()

  const [params] = useSearchParams()

  let navigation = useNavigation()

  let loading = navigation.state === "loading"
  let authstate = params.get("authstate")

  return (
    <>
      <div className="relative flex w-full items-center justify-center gap-8 ">
        {!data?.role ? (
          <Form method="post" action="/auth/signin">
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
              <Logo className={`h-7 w-4 ${loading && "animate-wiggle"}`} />
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
