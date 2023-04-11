import { google } from "googleapis"

/*********************************************************
 * Create OAuth client from given tokens in cookie
 */
export async function getClient(accessToken: string) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_API_CLIENT_ID,
    process.env.GOOGLE_API_CLIENT_SECRET,
    process.env.GOOGLE_API_REDIRECT_URI
  )
  client.setCredentials({ access_token: accessToken })

  return client
}
