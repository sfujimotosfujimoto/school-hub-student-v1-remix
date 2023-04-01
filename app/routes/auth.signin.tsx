import { type LoaderArgs, json, redirect } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { google } from "googleapis"

export async function loader({ request }: LoaderArgs) {
  if (request.method !== "GET") {
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

  return redirect(authUrl)
}

export default function Signin() {
  return (
    <div>
      <Link
        to='/'
        className={`btn-success btn-md btn hidden border-0 shadow-md hover:bg-opacity-70 sm:inline-flex`}
      >
        Back to Home
      </Link>
    </div>
  )
}

/*
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 })
  }
    throw new Response("ERRROR IN LOADER!!", {
    status: 403,
    statusText: "You are not authorized!!",
  })
*/
