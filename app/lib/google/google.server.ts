import { type Auth, google } from "googleapis"

export async function getClientFromCode(code: string): Promise<{
  client: Auth.OAuth2Client
  tokens: Auth.Credentials
}> {
  // logger.debug(`✅ getClientFromCode`)
  // creates oauth2Client from client_id and client_secret
  const client = initializeClient()

  // get token from OAuth client
  const { tokens } = await client.getToken(code)

  // set credentials with refresh_token
  client.setCredentials(tokens)

  return {
    client,
    tokens,
  }
}

export async function getRefreshedToken(
  accessToken: string,
  refreshToken: string,
): Promise<Auth.Credentials> {
  // logger.debug(`✅ getRefreshedToken`)
  const client = initializeClient()
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  const { credentials } = await client.refreshAccessToken()

  return credentials
}

export async function getClient(accessToken: string) {
  // logger.debug(`✅ getClient`)
  const client = initializeClient()
  client.setCredentials({ access_token: accessToken })

  return client
}

export function initializeClient(): Auth.OAuth2Client {
  // logger.debug(`✅ initializeClient`)
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_API_CLIENT_ID,
    process.env.GOOGLE_API_CLIENT_SECRET,
    process.env.GOOGLE_API_REDIRECT_URI,
  )
  return client
}

export async function getServiceAccountClient() {
  if (process.env.GOOGLE_SERVICE_KEY === undefined) {
    throw Error("No GOOGLE_SERVICE_KEY")
  }

  const credential = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_KEY).toString(),
  )

  const client = await google.auth.getClient({
    projectId: "my-folder-project-371111",
    credentials: {
      client_email: credential.client_email,
      private_key: credential.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  })

  return client
}

/**
 * Refresh token
 * used in
 * `auth.signin/route.tsx`
 */
export async function refreshToken(refreshToken: string, expiry: Date) {
  if (expiry.getTime() < new Date().getTime()) {
    return null
  }
  const oauth2Client = initializeClient()
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })
  const token = await oauth2Client.refreshAccessToken()
  return token
}
