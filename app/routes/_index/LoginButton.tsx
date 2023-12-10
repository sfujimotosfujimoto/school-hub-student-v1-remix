import {
  Form,
  useNavigation,
  useRouteLoaderData,
  useSearchParams,
} from "@remix-run/react"
import { Logo } from "~/components/icons"
import Toast from "~/components/util/Toast"

import type { loader } from "~/routes/_index/route"

export default function LoginButton() {
  const loaderData = useRouteLoaderData<typeof loader>("routes/_index")

  const [params] = useSearchParams()

  let navigation = useNavigation()

  let loading = navigation.state === "loading"
  let authstate = params.get("authstate")

  return (
    <>
      <div className="relative flex w-full items-center justify-center gap-8 ">
        {!loaderData?.role ? (
          <Form reloadDocument method="post" action="/auth/signin">
            <button type="submit" className={`btn btn-success w-64 shadow-lg`}>
              <Logo className="h-7 w-4" />
              <span className="ml-2 sm:ml-4 sm:inline">
                SCHOOL HUB サインイン
              </span>
            </button>
          </Form>
        ) : (
          <Form method="post" action="/auth/signout">
            <button
              type="submit"
              className={`btn btn-error w-64  border-0 shadow-lg hover:bg-opacity-70`}
            >
              <Logo className={`h-7 w-4 ${loading && "animate-spin"}`} />
              <span className="ml-1 sm:ml-2 sm:inline">
                SCHOOL HUB サインアウト
              </span>
            </button>
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
