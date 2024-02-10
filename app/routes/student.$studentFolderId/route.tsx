import type { MetaFunction } from "@remix-run/node"
import { Outlet, useParams } from "@remix-run/react"
import ErrorBoundaryDocument from "~/components/error-boundary-document"
/**
 * Meta Function
 */
export const meta: MetaFunction = () => {
  // const title =
  //   `${data?.student.gakunen}${data?.student.hr}${data?.student.hrNo}${data?.student.last}${data?.student.first}` ||
  //   ""

  return [
    {
      title: `SCHOOL HUB`,
    },
  ]
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

// /**
//  * LOADER function
//  */
// export async function loader({ request, params }: LoaderFunctionArgs) {
//   logger.debug(
//     `🍿 loader: student.$studentFolderId ${new URL(request.url).href}`,
//   )
//   const { user } = await getUserFromSession(request)
//   if (!user || !user.credential) throw redirectToSignin(request)
//   await requireUserRole(request, user)

//   const student = user.student

//   if (!student || !student.folderLink) throw redirectToSignin(request)

//   // Check if studentFolderId is the same as the student's folder
//   if (getFolderId(student.folderLink) !== params.studentFolderId) {
//     throw redirectToSignin(request)
//   }

//   const studentFolderId = params.studentFolderId
//   invariant(studentFolderId, "studentFolder in params is required")

//   const headers = new Headers()

//   headers.set("Cache-Control", `private, max-age=${CACHE_MAX_AGE_SECONDS}`)
//   return json(
//     {
//       studentFolderId: params.studentFolderId,
//       student,
//       role: user.role,
//     },
//     {
//       headers,
//     },
//   )
// }
