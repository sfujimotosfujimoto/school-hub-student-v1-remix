import { type LoaderFunctionArgs } from "@remix-run/node"
import ErrorBoundaryDocument from "~/components/error-boundary-document"
import { logger } from "~/lib/logger"
import { redirectToSignin } from "~/lib/responses"
import { createUserSession } from "~/lib/services/session.server"
import { signin } from "~/lib/services/signinout.server"

//update timeout
export const config = {
  // @note auth.redirect/route.tsx: set maxDuration for production
  maxDuration: 60,
}

export async function loader({ request }: LoaderFunctionArgs) {
  // get code from url query
  const parsedUrl = new URL(request.url)
  const code = parsedUrl.searchParams.get("code")

  // if no "code" , do not touch and resolve
  if (!code) throw redirectToSignin(request)

  logger.debug(`💥 start: signin()`)
  let start1 = performance.now()
  const { folderId, userId } = await signin({
    request,
    code,
  })
  let end1 = performance.now()
  logger.debug(`🔥   end: signin() \t\ttime: ${(end1 - start1).toFixed(2)} ms`)

  if (folderId === null && userId) {
    return createUserSession(userId, `/admin`)
  }

  return createUserSession(userId, `/student/${folderId}`)
}

export default function Redirect() {
  return <div>Redirect</div>
}

/**
 * Error Boundary
 */
export function ErrorBoundary() {
  let message = `問題が起きました。`

  return <ErrorBoundaryDocument toHome={true} message={message} />
}
