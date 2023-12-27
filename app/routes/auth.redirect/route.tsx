import { type LoaderFunctionArgs } from "@remix-run/node"

import { signin } from "~/lib/signinout.server"

import ErrorBoundaryDocument from "~/components/error-boundary-document"
import { redirectToSignin } from "~/lib/responses"

export async function loader({ request }: LoaderFunctionArgs) {
  // get code from url query
  const parsedUrl = new URL(request.url)
  const code = parsedUrl.searchParams.get("code")

  // if no "code" , do not touch and resolve
  if (!code) throw redirectToSignin()

  return signin({ code })
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
