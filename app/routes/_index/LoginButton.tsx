import {
  Form,
  useMatches,
  useNavigation,
  useSearchParams,
} from "@remix-run/react"

import { Logo } from "~/components/icons"
import Toast from "~/components/util/Toast"

export default function LoginButton() {
  const { user } = useMatches().filter((m) => m.id === "root")[0]?.data

  const [params] = useSearchParams()

  let navigation = useNavigation()

  let loading = navigation.state === "loading"
  let authstate = params.get("authstate")

  return (
    <>
      <div className="relative flex items-center justify-center w-full gap-8 ">
        {!user ? (
          <Form reloadDocument method="post" action="/auth/signin">
            <button type="submit" className={`btn-success btn w-64 shadow-lg`}>
              <Logo className="w-4 h-7" />
              <span className="ml-2 sm:ml-4 sm:inline">
                SCHOOL HUB サインイン
              </span>
            </button>
          </Form>
        ) : (
          <Form method="post" action="/auth/signout">
            <button
              type="submit"
              className={`btn-error btn w-64  border-0 shadow-lg hover:bg-opacity-70`}
            >
              <Logo className={`h-7 w-4 ${loading && "animate-spin"}`} />
              <span className="ml-1 sm:ml-2 sm:inline">
                SCHOOL HUB サインアウト
              </span>
            </button>
          </Form>
        )}

        <div className="toast-end toast">
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
