import type { MetaFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import ErrorBoundaryDocument from "~/components/error-boundary-document"

export default function AdminLayoutPage() {
  return <Outlet />
}

export const meta: MetaFunction = () => {
  return [{ title: `ADMIN | SCHOOL HUB` }]
}

/**
 * Error Boundary
 */
export function ErrorBoundary() {
  let message = `問題が起きました。`

  return <ErrorBoundaryDocument toHome={true} message={message} />
}
