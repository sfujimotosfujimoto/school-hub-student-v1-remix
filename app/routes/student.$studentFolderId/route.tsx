import { defer } from "@remix-run/node"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { Outlet, useLoaderData, useParams } from "@remix-run/react"
import invariant from "tiny-invariant"

import { StudentSchema } from "~/schemas"
import type { Student } from "~/types"

import { requireUserRole } from "~/lib/require-roles.server"
import { logger } from "~/lib/logger"
import { getFolderId } from "~/lib/utils"
import { getUserFromSession } from "~/lib/services/session.server"

import ErrorBoundaryDocument from "~/components/error-boundary-document"
import StudentHeader from "./student-header"
import { redirectToSignin } from "~/lib/responses"

/**
 * Meta Function
 */
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title =
    `${data?.student.gakunen}${data?.student.hr}${data?.student.hrNo}${data?.student.last}${data?.student.first}` ||
    ""

  return [
    {
      title: `${title} | SCHOOL HUB`,
    },
  ]
}

/**
 * LOADER function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  logger.debug(
    `🍿 loader: student.$studentFolderId ${new URL(request.url).href}`,
  )
  const user = await getUserFromSession(request)

  if (!user || !user.credential)
    throw redirectToSignin(`redirect=${encodeURI(new URL(request.url).href)}`)

  // const { user } = await authenticate(request)
  await requireUserRole(user)

  const student = user.student

  if (!student || !student.folderLink) throw redirectToSignin()

  // Check if studentFolderId is the same as the student's folder
  if (getFolderId(student.folderLink) !== params.studentFolderId) {
    throw redirectToSignin()
  }

  const studentFolderId = params.studentFolderId
  invariant(studentFolderId, "studentFolder in params is required")

  // Get drive files from Google Drive API
  // const driveFiles = await getDriveFiles(
  //   user.credential.accessToken,
  //   `trashed=false and '${studentFolderId}' in parents`,
  // )

  // // Save DriveFile to DriveFileData in DB
  // let dfd: DriveFileData[] = []
  // if (driveFiles && driveFiles.length > 0) {
  //   dfd = await saveDriveFileData(user.id, driveFiles)
  // }

  // const { nendos, segments, extensions, tags } =
  //   getNendosSegmentsExtensionsTags(dfd, student)

  const headers = new Headers()

  headers.set("Cache-Control", `private, max-age=${60 * 60}`) // 1 hour

  return defer(
    {
      // data: dataPromises,
      studentFolderId: params.studentFolderId,
      // extensions,
      // segments,
      // driveFiles,
      student,
      // tags,
      // nendos,
      role: user.role,
      // driveFileData: dfd,
    },
    {
      headers,
    },
  )
}

/**
 * StudentFolderIdLayout
 * path = /student.$studentFolderId
 */
export default function StudentFolderIdLayout() {
  console.log("✅ student.$studentFolderId/route.tsx ~ 	😀 ")
  const { student } = useLoaderData<typeof loader>()
  // const { student, driveFilesDB } = useLoaderData<typeof loader>()

  const result = StudentSchema.safeParse(student)

  let resultStudent: Student | null = null
  if (result.success) {
    resultStudent = result.data
  }

  // JSX -------------------------
  return (
    <div className="container mx-auto h-full p-4 sm:p-8">
      <div className="mb-4 space-y-4">
        {resultStudent && <StudentHeader student={resultStudent} />}
      </div>
      {/* <Suspense
        fallback={<h1 className="text3xl font-bold">ファイルを検索中...</h1>}
        key={Math.random()}
      >
        <Await
          resolve={driveFilesDB}
          errorElement={
            <ErrorBoundaryDocument
              toHome={true}
              message="ファイルが見つかりませんでした。"
            />
          }
        >
          {(resolved) => <Outlet />}
        </Await>
      </Suspense> */}
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

// function getNendosSegmentsExtensionsTags(
//   driveFiles: DriveFileData[],
//   student: Student,
// ) {
//   let segments: string[] = Array.from(
//     new Set(driveFiles?.map((d) => d.name.split(/[-_.]/)).flat()),
//   )

//   segments = filterSegments(segments, student)

//   const extensions: string[] =
//     Array.from(new Set(driveFiles?.map((d) => d.mimeType))).map(
//       (ext) => ext.split(/[/.]/).at(-1) || "",
//     ) || []

//   const tags: string[] = Array.from(
//     new Set(
//       driveFiles
//         ?.map((df) => {
//           if (df.appProperties?.tags)
//             return parseTags(df.appProperties.tags) || null
//           return null
//         })
//         .filter((g): g is string[] => g !== null)
//         .flat(),
//     ),
//   ).sort()

//   const nendos: string[] = Array.from(
//     new Set(
//       driveFiles
//         ?.map((df) => {
//           if (df.appProperties?.nendo)
//             return df.appProperties.nendo.trim() || null
//           return null
//         })
//         .filter((g): g is string => g !== null)
//         .flat(),
//     ),
//   )
//     .sort((a, b) => Number(b) - Number(a))
//     .filter((n): n is string => n !== null)

//   return {
//     nendos,
//     segments,
//     extensions,
//     tags,
//   }
// }

// async function getDriveFilesPromises(
//   accessToken: string,
//   userId: number,
//   studentFolderId: string,
//   student: Student,
// ) {
//   const driveFiles = await getDriveFiles(
//     accessToken,
//     `trashed=false and '${studentFolderId}' in parents`,
//   )

//   let dfPromises: Promise<DriveFileData | null>[] = []
//   if (driveFiles && driveFiles.length > 0) {
//     dfPromises = saveDriveFileData(userId, driveFiles)
//   }

//   let segments: string[] = Array.from(
//     new Set(driveFiles?.map((d) => d.name.split(/[-_.]/)).flat()),
//   )

//   segments = filterSegments(segments, student)

//   const extensions: string[] =
//     Array.from(new Set(driveFiles?.map((d) => d.mimeType))).map(
//       (ext) => ext.split(/[/.]/).at(-1) || "",
//     ) || []

//   const tags: string[] = Array.from(
//     new Set(
//       driveFiles
//         ?.map((df) => {
//           if (df.appProperties?.tags)
//             return parseTags(df.appProperties.tags) || null
//           return null
//         })
//         .filter((g): g is string[] => g !== null)
//         .flat(),
//     ),
//   ).sort()

//   const nendos: string[] = Array.from(
//     new Set(
//       driveFiles
//         ?.map((df) => {
//           if (df.appProperties?.nendo)
//             return df.appProperties.nendo.trim() || null
//           return null
//         })
//         .filter((g): g is string => g !== null)
//         .flat(),
//     ),
//   )
//     .sort((a, b) => Number(b) - Number(a))
//     .filter((n): n is string => n !== null)
//   return {
//     driveFiles,
//     dfPromises,
//     segments,
//     extensions,
//     tags,
//     nendos,
//   }
// }
