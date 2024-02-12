import { redirect } from "@remix-run/node"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { Form, useNavigation } from "@remix-run/react"

import { initializeClient } from "~/lib/google/google.server"
import { logger } from "~/lib/logger"
import {
  getRefreshUserFromSession,
  getUserFromSession,
  updateSession,
} from "~/lib/services/session.server"

import { Button } from "~/components/buttons/button"
import { DriveLogoIcon, LogoIcon } from "~/components/icons"
import { getFolderId, toLocaleString } from "~/lib/utils"
import type { User } from "~/types"
import ErrorBoundaryDocument from "~/components/error-boundary-document"
import clsx from "clsx"
import { errorResponses } from "~/lib/error-responses"

export const config = {
  maxDuration: 60,
}

/**
 * Root loader
 */
export async function loader({ request }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: auth.signin ${request.url}`)
  const { user } = await getUserFromSession(request)

  // if user is expired, check for refresh token
  if (!user) {
    // get refresh token expiry
    logger.debug("🐝 before getRefreshUserFromSession: in if (!user)")
    const refreshUser = await getRefreshUserFromSession(request)
    if (!refreshUser) {
      // @todo auth.signin/route.tsx: Need to use errorResponses
      logger.debug("🐝 auth.signin: !refreshUser: returnin null")
      return null
    }

    const res = await fetchRefresh(refreshUser)

    logger.info(
      `👑 auth.signin: expiry: ${toLocaleString(
        res.data.user.credential.expiry,
      )}`,
    )

    // if couldn't get new access_token, expiry_date, refresh_token from google
    if (!res.ok) {
      throw errorResponses.unauthroized()
    }

    // update the session with the new values
    const headers = await updateSession("userId", res.data.user.id)

    const redirectUrl = new URL(request.url).searchParams.get("redirect")
    // redirect to the same URL if the request was a GET (loader)
    if (request.method === "GET") {
      logger.debug(`👑 auth.signin: request GET redirect: ${redirectUrl}`)
      throw redirect(redirectUrl ? redirectUrl : request.url, { headers })
    }
  }

  // get redirect from search params
  const redirectUrl = new URL(request.url).searchParams.get("redirect")
  if (redirectUrl) {
    logger.debug(
      `👑 auth.signin: found redirectURL, redirecting to ${redirectUrl}`,
    )
    throw redirect(redirectUrl)
  }

  const folderId = getFolderId(user?.student?.folderLink || "")

  if (folderId) {
    throw redirect(`/student/${folderId}`)
  } else {
    throw redirect(`/`)
  }
}

async function fetchRefresh(user: User) {
  logger.debug("🍺 fetchRefresh: ")

  const res = await fetch(`${process.env.BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {
        user,
        email: user.email,
        accessToken: user.credential?.accessToken,
        refreshToken: user.credential?.refreshToken,
      },
      // (key, value) => (typeof value === "bigint" ? Number(value) : value),
    ),
  })
    .then((res) => {
      logger.debug("👑 auth.signin: fetch res")
      return res.json()
    })
    .catch((err) => {
      console.error(`❌ auth.signin: fetch error`, err.message, err)
      return { error: "error in fetch" }
    })
  return res
}

const scopes = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]

/**
 * ACTION
 */
export async function action({ request }: ActionFunctionArgs) {
  logger.debug(`🍺 action: auth.signin ${request.url}`)

  // create OAuth2 client with id and secret
  const oauth2Client = initializeClient()

  // @note auth.signin/route.tsx: changed access_type to "online" and prompt to "select_account" only
  // This means that the user will not bet a refresh token and will have to sign in again
  // get authorization URL from created client
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "online",
    // access_type: "offline",
    scope: scopes,
    include_granted_scopes: false,
    // include_granted_scopes: true,
    prompt: "select_account",
    // prompt: "consent select_account",
  })

  return redirect(authUrl, { status: 302 })
}

export default function AuthSigninPage() {
  // console.log("✅ auth.signin/route.tsx ~ 	😀 ")
  const navigation = useNavigation()
  const isNavigating = navigation.state !== "idle"
  return (
    <>
      <section
        className={clsx(
          `mx-auto flex h-full w-screen max-w-7xl flex-col items-center justify-center gap-8 text-sfblue-300`,
          { "opacity-40": isNavigating },
        )}
      >
        <div className="flex items-center">
          <LogoIcon className="w-16 sm:w-24" />
          <DriveLogoIcon className="w-24 h-24" />
        </div>

        <div className="max-w-xl p-4 rounded-lg shadow-lg bg-base-100">
          <span
            className={clsx(
              `font-bold underline decoration-sfred-200 decoration-4 underline-offset-4`,
            )}
          >
            Google アカウント
          </span>
          でサインインしてください。
        </div>

        <GoogleSigninButton disabled={isNavigating} />
      </section>
    </>
  )
}

function GoogleSigninButton({ disabled }: { disabled: boolean }) {
  return (
    <>
      <div className="relative flex items-center justify-center w-full gap-8 ">
        <Form method="post" action="/auth/signin">
          <Button type="submit" variant="info" size="md" disabled={disabled}>
            <DriveLogoIcon className="h-7" />
            <span id="google-signin">Google サインイン</span>
          </Button>
        </Form>
      </div>
    </>
  )
}

/**
 * Error Boundary
 */
export function ErrorBoundary() {
  let message = `問題が起きました。`

  return <ErrorBoundaryDocument toHome={true} message={message} />
}
