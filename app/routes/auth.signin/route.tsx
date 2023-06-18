import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node"
import { Link } from "@remix-run/react"
import { google } from "googleapis"

// the default scopes are set in console.google
const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/contacts",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]

function getOAuthUrl() {
  // create OAuth2 client with id and secret
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_API_CLIENT_ID,
    process.env.GOOGLE_API_CLIENT_SECRET,
    process.env.GOOGLE_API_REDIRECT_URI
  )

  // get authorization URL from created client
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "online",
    scope: SCOPES,
    include_granted_scopes: true,
    prompt: "select_account",
  })

  return authUrl
}

export async function action({ request }: ActionArgs) {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 })
  }

  // get authorization URL from created client
  const authUrl = getOAuthUrl()

  return redirect(authUrl, { status: 302 })
}

export async function loader({ request }: LoaderArgs) {
  // get authorization URL from created client
  const authUrl = getOAuthUrl()

  return redirect(authUrl, { status: 302 })
}

export default function Signin() {
  return (
    <div>
      <Link
        to="/"
        className={`btn-success btn-md btn hidden border-0 shadow-md hover:bg-opacity-70 sm:inline-flex`}
      >
        Back to Home
      </Link>
    </div>
  )
}

/*

*/
