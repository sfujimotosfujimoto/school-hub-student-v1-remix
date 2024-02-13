import type { LoaderFunctionArgs } from "@remix-run/node"
import { redirect, useLocation } from "@remix-run/react"
import ErrorBoundaryDocument from "~/components/error-boundary-document"
import { logger } from "~/lib/logger"

export async function loader({ params, request }: LoaderFunctionArgs) {
  const p = Object.values(params).at(0)
  logger.debug(`✅ routes/$.tsx ~ 	${p}`)

  if (p?.match(/^apple-(\w.*|)icon-.*(.png|.jpg|.ico)$/)) {
    throw redirect("/apple-touch-icon.png")
  } else if (p?.match(/^favicon.*.png$/)) {
    throw redirect("/favicon.png")
  }

  throw new Response("Not found", { status: 404, statusText: `${request.url}` })
}

export default function NotFound() {
  console.error("✅ routes/$.tsx ~ 404")
  // due to the loader, this component will never be rendered, but we'll return
  // the error boundary just in case.
  return <ErrorBoundary />
}

/**
 * Error Boundary
 */
export function ErrorBoundary() {
  const location = useLocation()
  let message = `URL: ${location.pathname} は見つかりませんでした。`
  return <ErrorBoundaryDocument message={message} />
}
