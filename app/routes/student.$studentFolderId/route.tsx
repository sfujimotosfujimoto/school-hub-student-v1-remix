import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { Outlet, json, useParams } from "@remix-run/react"
import ErrorBoundaryDocument from "~/components/error-boundary-document"
import { CACHE_MAX_AGE_SECONDS } from "~/config"
/**
 * Meta Function
 */
export const meta: MetaFunction = () => {
  return [
    {
      title: `SCHOOL HUB`,
    },
  ]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers()
  headers.set("Cache-Control", `private, max-age=${CACHE_MAX_AGE_SECONDS}`)
  return json(null, {
    headers,
  })
}

/**
 * StudentFolderIdLayout
 * path = /student.$studentFolderId
 */
export default function StudentFolderIdLayout() {
  // JSX -------------------------
  return (
    <div className="container h-full p-4 mx-auto sm:p-8">
      <Outlet />
    </div>
  )
}

/**
 * Error Boundary
 */
export function ErrorBoundary() {
  const { studentFolderId } = useParams()
  let message = `フォルダID（${studentFolderId}）からフォルダを取得できませんでした。`
  return <ErrorBoundaryDocument message={message} />
}
