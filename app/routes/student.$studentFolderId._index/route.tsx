import { defer, type LoaderFunctionArgs } from "@remix-run/node"
import {
  Await,
  useLoaderData,
  useNavigation,
  useParams,
  useRouteError,
} from "@remix-run/react"
import { Suspense } from "react"
import BackButton from "~/components/back-button"
import ErrorBoundaryDocument from "~/components/error-boundary-document"
import { CACHE_MAX_AGE_SECONDS } from "~/config"
import { logger } from "~/lib/logger"
import { redirectToSignin } from "~/lib/responses"
import { getDriveFileDataByFolderId } from "~/lib/services/drive-file-data.server"
import { getUserFromSession } from "~/lib/services/session.server"
import { filterSegments, parseTags } from "~/lib/utils"
import { convertDriveFileData } from "~/lib/utils-loader"
import type { DriveFileData, Student } from "~/types"
import AllPill from "./all-pill"
import ExtensionPills from "./extensions-pills"
import FileCount from "./file-count"
import NendoPills from "./nendo-pills"
import SegmentPills from "./segment-pills"
import StudentCards from "./student-cards"
import TagPills from "./tag-pills"

/**
 * LOADER function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  logger.debug(
    `🍿 loader: student.$studentFolderId._index ${new URL(request.url).href}`,
  )
  const { studentFolderId } = params
  if (!studentFolderId) throw Error("id route parameter must be defined")

  const { user } = await getUserFromSession(request)
  if (!user || !user.credential) throw redirectToSignin(request)

  const student = user.student
  if (!student || !student.folderLink) throw redirectToSignin(request)

  const url = new URL(request.url)
  const nendoString = url.searchParams.get("nendo")
  const tagString = url.searchParams.get("tags")
  const segmentsString = url.searchParams.get("segments")
  const extensionsString = url.searchParams.get("extensions")

  const promiseData: Promise<{
    nendos: string[]
    segments: string[]
    extensions: string[]
    tags: string[]
    driveFileData: DriveFileData[]
  }> = new Promise(async (resolve, reject) => {
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

    resolve({
      nendos,
      segments,
      extensions,
      tags,
      driveFileData,
    })
  })

  const headers = new Headers()

  headers.set("Cache-Control", `private, max-age=${CACHE_MAX_AGE_SECONDS}`) // 10 minutes

  return defer(
    {
      tagString,
      url: request.url,
      studentFolderId,
      promiseData,
    },
    {
      headers,
    },
  )
  // return defer(
  //   {
  //     tagString,
  //     url: request.url,
  //     nendos,
  //     segments,
  //     extensions,
  //     tags,
  //     studentFolderId,
  //     driveFileData,
  //   },
  //   {
  //     headers,
  //   },
  // )
}

function getFilteredDriveFiles(
  driveFiles: DriveFileData[],
  nendoString: string | null,
  tagString: string | null,
  segmentsString: string | null,
  extensionsString: string | null,
) {
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
// type LoaderData = SerializeFrom<typeof loader>
/**
 * StudentFolderIndexPage Component
 */
export default function StudentFolderIdIndexPage() {
  const navigation = useNavigation()
  const isNavigating = navigation.state !== "idle"

  const { studentFolderId, url, promiseData } = useLoaderData<typeof loader>()
  // const {
  //   studentFolderId,
  //   url,
  //   nendos,
  //   tags,
  //   extensions,
  //   segments,
  //   driveFileData,
  // } = useLoaderData<SerializeFrom<typeof loader>>()

  // const dfd = convertDriveFileData(driveFileData)

  // JSX -------------------------
  return (
    <>
      <section className="flex flex-col h-full space-y-4">
        <Suspense fallback={<SkeletonUI />} key={Math.random()}>
          <Await
            resolve={promiseData}
            errorElement={
              <ErrorBoundaryDocument
                toHome={true}
                message="ファイルが見つかりませんでした。"
              />
            }
          >
            {({ driveFileData, nendos, tags, extensions, segments }) => {
              const dfd = convertDriveFileData(driveFileData)
              return (
                <>
                  <div className="flex items-center justify-between flex-none">
                    <BackButton />

                    <FileCount driveFiles={dfd} />
                  </div>
                  <div className="flex flex-wrap flex-none gap-1">
                    <AllPill url={url} studentFolderId={studentFolderId} />
                    {nendos.length > 0 && (
                      <div className="mx-0 divider divider-horizontal"></div>
                    )}
                    <NendoPills url={url} nendos={nendos} />
                    {tags.length > 0 && (
                      <div className="mx-0 divider divider-horizontal"></div>
                    )}
                    <TagPills url={url} tags={tags} />
                    {extensions.length > 0 && (
                      <div className="mx-0 divider divider-horizontal"></div>
                    )}
                    <ExtensionPills url={url} extensions={extensions} />
                    {segments.length > 0 && (
                      <div className="mx-0 divider divider-horizontal"></div>
                    )}
                    <SegmentPills url={url} segments={segments} />
                  </div>

                  <div className="flex-auto px-2 mt-4 mb-12 overflow-x-auto">
                    <StudentCards
                      driveFiles={dfd}
                      isNavigating={isNavigating}
                    />
                  </div>
                </>
              )
            }}
          </Await>
        </Suspense>
      </section>
    </>
  )
}

function SkeletonUI() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="skeleton h-64"></div>
      <div className="skeleton h-64"></div>
      <div className="skeleton h-64"></div>
      <div className="skeleton h-64"></div>
    </div>
  )
}

/**
 * Error Boundary
 */
export function ErrorBoundary() {
  const { studentFolderId } = useParams()
  const error = useRouteError()
  console.error(error)
  let message = `フォルダID（${studentFolderId}）からフォルダを取得できませんでした。`
  return <ErrorBoundaryDocument message={message} />
}

/*
          <Suspense
            fallback={<h1 className="font-bold text3xl">Counting...</h1>}
            key={Math.random()}
          >
            <Await resolve={driveFiles} errorElement={<span></span>}>
              {(resolved) => <FileCount driveFiles={resolved} />}
            </Await>
          </Suspense>


                    <Suspense
            fallback={
              <h1 className="font-bold text3xl">ファイルを検索中...</h1>
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
