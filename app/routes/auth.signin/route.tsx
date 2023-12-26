import { redirect } from "@remix-run/node"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { Form } from "@remix-run/react"

import { initializeClient } from "~/lib/google/google.server"
import { logger } from "~/lib/logger"
import {
  getRefreshUserFromSession,
  getUserFromSession,
  sessionStorage,
} from "~/lib/services/session.server"

import { Button } from "~/components/buttons/button"
import { DriveLogoIcon, LogoIcon } from "~/components/icons"
import { getFolderId } from "~/lib/utils"

// import { getUserFromSession } from "~/lib/services/session.server"

/**
 * Root loader
 */
export async function loader({ request }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: auth.signin ${request.url}`)
  const user = await getUserFromSession(request)
  // const { user } = await authenticate(request)

  // if user is expired, check for refresh token
  if (!user) {
    // get refresh token expiry
    const refreshUser = await getRefreshUserFromSession(request)
    if (!refreshUser) {
      return null
    }

    const redirectUrl = new URL(request.url).searchParams.get("redirect")

    const jsn = await fetch(`${process.env.BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user,
        email: refreshUser.email,
        accessToken: refreshUser.credential?.accessToken,
        refreshToken: refreshUser.credential?.refreshToken,
      }),
    })
      .then((res) => {
        logger.debug("👑 authenticate: fetch res")
        return res.json()
      })
      .catch((err) => {
        console.error(`❌ authenticate: fetch error`, err.message, err)
        return { error: "error in fetch" }
      })

    logger.info(
      `👑 authenticate: expiry: ${new Date(
        Number(jsn.data.user.credential.expiry || 0),
      ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
    )
    if (!jsn.ok) {
      throw redirect("/auth/signin?authstate=unauthorized-refresherror")
    }
    // update the session with the new values
    const session = await sessionStorage.getSession()
    session.set("userJWT", jsn.data.userJWT)
    // commit the session and append the Set-Cookie header
    const headers = new Headers()
    headers.append("Set-Cookie", await sessionStorage.commitSession(session))

    // redirect to the same URL if the request was a GET (loader)
    if (request.method === "GET") {
      logger.debug("👑 authenticate: request GET redirect")
      throw redirect(redirectUrl ? redirectUrl : request.url, { headers })
    }
  }

  const folderId = getFolderId(user?.student?.folderLink || "")

  if (folderId) {
    throw redirect(`/student/${folderId}`)
  } else {
    throw redirect(`/`)
  }
}

const scopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
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

  // get authorization URL from created client
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
    prompt: "consent select_account",
  })

  return redirect(authUrl, { status: 302 })
}

export default function AuthSignin() {
  console.log("✅ auth.signin/route.tsx ~ 	😀 ")
  return (
    <>
      <section className="mx-auto flex h-full w-screen max-w-7xl flex-col items-center justify-center gap-8 text-sfblue-300">
        <div className="flex items-center">
          <LogoIcon className=" w-16 sm:w-24" />
          <DriveLogoIcon className="h-24 w-24" />
        </div>

        <div className="max-w-xl rounded-lg bg-base-100 p-4 shadow-lg">
          <span className="font-bold underline decoration-sfred-200 decoration-4 underline-offset-4">
            Google アカウント
          </span>
          でサインインしてください。
        </div>

        <GoogleSigninButton />
      </section>
    </>
  )
}

function GoogleSigninButton() {
  return (
    <>
      <div className="relative flex w-full items-center justify-center gap-8 ">
        <Form method="post" action="/auth/signin">
          <Button type="submit" variant="info" size="md">
            <DriveLogoIcon className="h-7" />
            <span className="">Google サインイン</span>
          </Button>
        </Form>
      </div>
    </>
  )
}
