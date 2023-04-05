import {
  type LoaderArgs,
  json,
  redirect,
  type ActionArgs,
} from "@remix-run/node"
import { Link } from "@remix-run/react"
import { google } from "googleapis"

export async function action({ request }: ActionArgs) {
  console.log("🚀 routes/auth.signin.tsx ~ 	🙂 in action")
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 })
  }

  // create OAuth2 client with id and secret
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_API_CLIENT_ID,
    process.env.GOOGLE_API_CLIENT_SECRET,
    process.env.GOOGLE_API_REDIRECT_URI
  )

  // the default scopes are set in console.google
  const scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/contacts",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ]

  // get authorization URL from created client
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "online",
    scope: scopes,
    include_granted_scopes: true,
  })

  console.log("🚀 routes/auth.signin.tsx action ~ 	🌈 authUrl ✨ ", authUrl)

  return redirect(authUrl, { status: 302 })
}

export async function loader({ request }: LoaderArgs) {
  console.log("🚀 routes/auth.signin.tsx ~ 	🙂 in loader")
  if (request.method !== "GET") {
    throw json({ message: "Invalid request method" }, { status: 400 })
  }

  // create OAuth2 client with id and secret
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_API_CLIENT_ID,
    process.env.GOOGLE_API_CLIENT_SECRET,
    process.env.GOOGLE_API_REDIRECT_URI
  )

  console.log("🚀 routes/auth.signin.tsx ~ 	🙂 after oauth2Client")

  // the default scopes are set in console.google
  const scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/contacts",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ]

  // get authorization URL from created client
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "online",
    scope: scopes,
    include_granted_scopes: true,
  })

  console.log("🚀 routes/auth.signin.tsx ~ 	🌈 authUrl ✨ ", authUrl)

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
