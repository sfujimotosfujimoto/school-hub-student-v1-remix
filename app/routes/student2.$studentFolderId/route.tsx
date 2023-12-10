import invariant from "tiny-invariant"
import * as driveS from "~/lib/google/drive.server"
import { filterSegments, getFolderId, parseTags } from "~/lib/utils"

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import {
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useMatches,
  useParams,
  useRouteError,
} from "@remix-run/react"

import StudentHeader from "./StudentHeader"

import { logger } from "~/lib/logger"
import { authenticate } from "~/lib/authenticate.server"
import { requireUserRole } from "~/lib/require-roles.server"
import { StudentSchema } from "~/schemas"
import type { Student } from "~/types"
import BackButton from "~/components/BackButton"
import ErrorDocument from "~/root/ErrorDocument"

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
  logger.debug(`🍿 loader: student2.$studentFolderId ${request.url}`)
  const { user } = await authenticate(request)
  await requireUserRole(user)

  if (!user || !user.credential) throw redirect("/?authstate=unauthorized")

  const student = user.student

  if (!student || !student.folderLink)
    throw redirect("/?authstate=unauthorized")

  if (getFolderId(student.folderLink) !== params.studentFolderId) {
    throw redirect("/?authstate=unauthorized")
  }

  const studentFolderId = params.studentFolderId
  invariant(studentFolderId, "studentFolder in params is required")

  const driveFiles = await driveS.getDriveFiles(
    user.credential.accessToken,
    `trashed=false and '${studentFolderId}' in parents`,
  )

  let segments: string[] = Array.from(
    new Set(driveFiles?.map((d) => d.name.split(/[-_.]/)).flat()),
  )

  segments = filterSegments(segments, student)

  const extensions: string[] =
    Array.from(new Set(driveFiles?.map((d) => d.mimeType))).map(
      (ext) => ext.split(/[/.]/).at(-1) || "",
    ) || []

  const tags: string[] = Array.from(
    new Set(
      driveFiles
        ?.map((df) => {
          if (df.appProperties?.tags)
            return parseTags(df.appProperties.tags) || null
          return null
        })
        .filter((g): g is string[] => g !== null)
        .flat(),
    ),
  ).sort()

  const nendos: string[] = Array.from(
    new Set(
      driveFiles
        ?.map((df) => {
          if (df.appProperties?.nendo)
            return df.appProperties.nendo.trim() || null
          return null
        })
        .filter((g): g is string => g !== null)
        .flat(),
    ),
  )
    .sort((a, b) => Number(b) - Number(a))
    .filter((n): n is string => n !== null)

  const headers = new Headers()

  headers.set("Cache-Control", `private, max-age=${60 * 60}`) // 1 hour

  return json(
    {
      studentFolderId: params.studentFolderId,
      extensions,
      segments,
      driveFiles,
      student,
      tags,
      nendos,
      role: user.role,
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
  const matches = useMatches()
  console.log(
    "✅ student2.$studentFolderId._index/route.tsx ~ 	🌈 matches ✅ ",
    matches,
  )
  console.log("✅ student2.$studentFolderId/route.tsx ~ 	😀 ")
  const { student } = useLoaderData<typeof loader>()
  const result = StudentSchema.safeParse(student)

  let resultStudent: Student | null = null
  if (result.success) {
    resultStudent = result.data
  }

  // JSX -------------------------
  return (
    <div className="container mx-auto h-screen p-8 pt-14 sm:pt-8">
      Student2$StudentFolderId
      <div className="mb-4 space-y-4">
        {resultStudent && <StudentHeader student={resultStudent} />}
      </div>
      <Outlet />
    </div>
  )
}

/**
 * Error Boundary
 */
export function ErrorBoundary() {
  const error = useRouteError()
  const { id } = useParams()
  let heading = "Something went wrong"
  let message = `Apologies, something went wrong on our end,
  please try again.`
  if (isRouteErrorResponse(error) && error.status === 404) {
    heading = "Expense not found"
    message = `Apologies, the expense with the id ${id} cannot
  be found.`
  }
  return (
    <ErrorDocument>
      {/* <div
        className="m-auto flex w-full flex-col items-center
        justify-center gap-5 lg:max-w-3xl"
      > */}
      <h2 className="text-2xl">{heading}</h2>
      <p className="text-lg">{message}</p>
      {/* </div> */}
      <BackButton to="/" />
    </ErrorDocument>
  )
}
