import { redirect } from "@remix-run/node"
import type { ActionFunctionArgs } from "@remix-run/node"
import { initializeClient } from "~/lib/google/google.server"
import { logger } from "~/lib/logger"

const scopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]

export async function action({ request }: ActionFunctionArgs) {
  logger.debug(`🍺 action: auth.signin ${request.url}`)

  // create OAuth2 client with id and secret
  const oauth2Client = initializeClient()

  // get authorization URL from created client
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
    // TODO: check what this means
    prompt: "consent select_account",
  })

  return redirect(authUrl, { status: 302 })
}
