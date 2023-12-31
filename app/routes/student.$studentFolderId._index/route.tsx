import {
  Await,
  useLoaderData,
  useNavigation,
  useParams,
} from "@remix-run/react"
import { defer, type LoaderFunctionArgs } from "@remix-run/node"

import { getUserFromSession } from "~/lib/services/session.server"
import { filterSegments, parseTags } from "~/lib/utils"

import ErrorBoundaryDocument from "~/components/error-boundary-document"
import BackButton from "~/components/back-button"

import FileCount from "./components/file-count"
import NendoPills from "./components/nendo-pills"
import TagPills from "./components/tag-pills"
import SegmentPills from "./components/segment-pills"
import AllPill from "./components/all-pill"
import ExtensionPills from "./components/extensions-pills"
import StudentCards from "./components/student-cards"

import { getDriveFileDataByFolderId } from "~/lib/services/drive-file-data.server"
import { redirectToSignin } from "~/lib/responses"
import { Suspense } from "react"
import type { DriveFileData, Student } from "~/type.d"

/**
 * LOADER function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { studentFolderId } = params
  if (!studentFolderId) throw Error("id route parameter must be defined")

  const user = await getUserFromSession(request)
  if (!user || !user.credential) throw redirectToSignin(request)

  const student = user.student
  if (!student || !student.folderLink) throw redirectToSignin(request)

  const url = new URL(request.url)
  const nendoString = url.searchParams.get("nendo")
  const tagString = url.searchParams.get("tags")
  const segmentsString = url.searchParams.get("segments")
  const extensionsString = url.searchParams.get("extensions")

  // Get DriveFileData from DB
  let driveFileData = await getDriveFileDataByFolderId(studentFolderId)

  // Filter by nendo, tags, segments, extensions
  driveFileData = getFilteredDriveFiles(
    driveFileData || [],
    nendoString,
    tagString,
    segmentsString,
    extensionsString,
  )
  const { nendos, segments, extensions, tags } =
    getNendosSegmentsExtensionsTags(driveFileData, student)

  const headers = new Headers()

  headers.set("Cache-Control", `private, max-age=${60 * 10}`) // 10 minutes

  return defer(
    {
      nendoString,
      tagString,
      url: request.url,
      nendos,
      segments,
      extensions,
      tags,
      studentFolderId,
      driveFileData,
    },
    {
      headers,
    },
  )
}

function getFilteredDriveFiles(
  driveFiles: DriveFileData[],
  nendoString: string | null,
  tagString: string | null,
  segmentsString: string | null,
  extensionsString: string | null,
) {
  console.log("✅ in  getFilteredDriveFiles: driveFiles", driveFiles?.length)

  // filter by nendo
  if (nendoString) {
    driveFiles =
      driveFiles?.filter((df) => {
        const props = JSON.parse(df.appProperties || "[]")
        if (props.nendo === nendoString) return true
        return false
      }) || []
  }

  // filter by tag
  if (tagString) {
    driveFiles =
      driveFiles?.filter((df) => {
        const props = JSON.parse(df.appProperties || "[]")
        if (props.tags) {
          const tagsArr = parseTags(props.tags)
          return tagsArr.includes(tagString || "")
        }
        return false
      }) || []
  }

  // filter by extensions
  if (extensionsString) {
    driveFiles =
      driveFiles?.filter((df) => {
        const ext = df.mimeType.split(/[/.]/).at(-1) || ""
        return ext === extensionsString
      }) || []
  }

  // filter by segments
  if (segmentsString) {
    driveFiles =
      driveFiles?.filter((df) => {
        const segments = df.name.split(/[-_.]/)
        return segments.includes(segmentsString)
      }) || []
  }
  console.log("✅ driveFiles after filtering", driveFiles?.length)

  return (
    driveFiles.sort(
      (a, b) =>
        new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime(),
    ) || []
  )
}

function getNendosSegmentsExtensionsTags(
  driveFiles: DriveFileData[],
  student: Omit<Student, "users">,
) {
  console.log(
    "✅ in getNendosSegmentsExtensionsTags: driveFiles",
    driveFiles.length,
    "student",
    student.email,
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
          const appProps = JSON.parse(df.appProperties || "[]")
          if (appProps.tags) return parseTags(appProps.tags) || null
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
          const appProps = JSON.parse(df.appProperties || "[]")
          if (appProps.nendo) return appProps.nendo.trim() || null
          return null
        })
        .filter((g): g is string => g !== null)
        .flat(),
    ),
  )
    .sort((a, b) => Number(b) - Number(a))
    .filter((n): n is string => n !== null)

  return {
    nendos,
    segments,
    extensions,
    tags,
  }
}

/**
 * StudentFolderIndexPage Component
 */
export default function StudentFolderIdIndexPage() {
  const navigation = useNavigation()
  const isNavigating = navigation.state !== "idle"

  const {
    studentFolderId,
    url,
    nendos,
    tags,
    extensions,
    segments,
    driveFileData,
  } = useLoaderData<typeof loader>()

  // JSX -------------------------
  return (
    <>
      <section className="flex h-full flex-col space-y-4">
        <div className="flex flex-none items-center justify-between">
          <BackButton />

          <FileCount driveFiles={driveFileData} />
        </div>
        <div className="flex flex-none flex-wrap gap-1">
          <AllPill url={url} studentFolderId={studentFolderId} />
          {nendos.length > 0 && (
            <div className="divider divider-horizontal mx-0"></div>
          )}
          <NendoPills url={url} nendos={nendos} />
          {tags.length > 0 && (
            <div className="divider divider-horizontal mx-0"></div>
          )}
          <TagPills url={url} tags={tags} />
          {extensions.length > 0 && (
            <div className="divider divider-horizontal mx-0"></div>
          )}
          <ExtensionPills url={url} extensions={extensions} />
          {segments.length > 0 && (
            <div className="divider divider-horizontal mx-0"></div>
          )}
          <SegmentPills url={url} segments={segments} />
        </div>

        <div className="mb-12 mt-4 flex-auto overflow-x-auto px-2">
          <Suspense
            fallback={
              <h1 className="text3xl font-bold">ファイルを検索中...</h1>
            }
            key={Math.random()}
          >
            <Await
              resolve={driveFileData}
              errorElement={
                <ErrorBoundaryDocument
                  toHome={true}
                  message="ファイルが見つかりませんでした。"
                />
              }
            >
              {(resolved) => (
                <StudentCards
                  driveFiles={resolved}
                  isNavigating={isNavigating}
                />
              )}
            </Await>
          </Suspense>
        </div>
      </section>
    </>
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

/*
          <Suspense
            fallback={<h1 className="text3xl font-bold">Counting...</h1>}
            key={Math.random()}
          >
            <Await resolve={driveFiles} errorElement={<span></span>}>
              {(resolved) => <FileCount driveFiles={resolved} />}
            </Await>
          </Suspense>


                    <Suspense
            fallback={
              <h1 className="text3xl font-bold">ファイルを検索中...</h1>
            }
            key={Math.random()}
          >
            <Await
              resolve={driveFiles}
              errorElement={
                <ErrorBoundaryDocument
                  toHome={true}
                  message="ファイルが見つかりませんでした。"
                />
              }
            >
              {(resolved) => <StudentCards driveFiles={resolved} />}
              {/* {driveFiles && <StudentCards driveFiles={driveFiles} />} 
              </Await>
              </Suspense>

*/
