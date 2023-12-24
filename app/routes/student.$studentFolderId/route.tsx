import invariant from "tiny-invariant"
import * as driveS from "~/lib/google/drive.server"
import { filterSegments, getFolderId, parseTags } from "~/lib/utils"

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

import StudentHeader from "./StudentHeader"

import { logger } from "~/lib/logger"
import { authenticate } from "~/lib/authenticate.server"
import { requireUserRole } from "~/lib/require-roles.server"
import { StudentSchema } from "~/schemas"
import type { Student } from "~/types"
import DriveFilesProvider from "~/context/drive-files-context"
import NendoTagsProvider from "~/context/nendos-tags-context"

/**
 * StudentFolderIdLayout
 * path = /student.$studentFolderId
 */
export default function StudentFolderIdLayout() {
  const { student } = useLoaderData<typeof loader>()
  const result = StudentSchema.safeParse(student)

  let resultStudent: Student | null = null
  if (result.success) {
    resultStudent = result.data
  }

  // JSX -------------------------
  return (
    <DriveFilesProvider>
      <NendoTagsProvider>
        <div className="container mx-auto h-full p-8 pt-14 sm:pt-8">
          <div className="mb-4 space-y-4">
            {resultStudent && <StudentHeader student={resultStudent} />}
          </div>
          <Outlet />
        </div>
      </NendoTagsProvider>
    </DriveFilesProvider>
  )
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: student.$studentFolderId ${request.url}`)
  const { user } = await authenticate(request)
  await requireUserRole(user)

  if (!user || !user.credential) throw redirect("/?authstate=unauthorized")

  const student = user.student
  // const student = await sheetsS.getStudentByEmail(user.email)

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

  const tags: Set<string> = new Set(
    driveFiles
      ?.map((df) => {
        if (df.appProperties?.tags)
          return parseTags(df.appProperties.tags) || null
        return null
      })
      .filter((g): g is string[] => g !== null)
      .flat(),
  )
  const nendos: Set<string> = new Set(
    driveFiles
      ?.map((df) => {
        if (df.appProperties?.nendo)
          return df.appProperties.nendo.trim() || null
        return null
      })
      .filter((g): g is string => g !== null)
      .flat(),
  )

  return json(
    {
      studentFolderId,
      extensions,
      segments,
      driveFiles,
      student,
      tags: Array.from(tags),
      nendos: Array.from(nendos),
      role: user.role,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": `max-age=${60 * 10}`,
      },
    },
  )
}

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
