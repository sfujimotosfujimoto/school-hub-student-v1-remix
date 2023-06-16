import { google } from "googleapis"

export function initializeClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_API_CLIENT_ID,
    process.env.GOOGLE_API_CLIENT_SECRET,
    process.env.GOOGLE_API_REDIRECT_URI
  )
  return client
}

export async function getClient(accessToken: string) {
  const client = initializeClient()
  client.setCredentials({ access_token: accessToken })

  return client
}

export async function getServiceAccountClient() {
  if (process.env.GOOGLE_SERVICE_KEY === undefined) {
    throw Error("No GOOGLE_SERVICE_KEY")
  }

  const credential = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_KEY).toString()
  )

  const client = await google.auth.getClient({
    projectId: "my-folder-project-371111",
    credentials: {
      client_email: credential.client_email,
      private_key: credential.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  return client
}
