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
import { getSession } from "~/lib/services/session.server"
import { convertDriveFiles, convertStudent } from "~/lib/utils-loader"
import type { DriveFile } from "~/types"
import AllPill from "./all-pill"
import ExtensionPills from "./extensions-pills"
import FileCount from "./file-count"
import NendoPills from "./nendo-pills"
import SegmentPills from "./segment-pills"
import StudentCards from "./student-cards"
import TagPills from "./tag-pills"
import StudentHeader from "./student-header"
import SkeletonUI from "~/components/skeleton-ui"
import { SearchIcon } from "~/components/icons"
import { getDriveFiles } from "~/lib/google/drive.server"
import { getFilteredDriveFiles, getNendosSegmentsExtensionsTags } from "./utils"
import { Pill } from "./pill"
import { getStudentByEmail } from "~/lib/google/sheets.server"

/**
 * LOADER function
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  logger.debug(
    `🍿 loader: student.$studentFolderId._index ${new URL(request.url).href}`,
  )
  const { studentFolderId } = params
  if (!studentFolderId) throw Error("id route parameter must be defined")

  const { accessToken, email } = await getSession(request)
  // const { user } = await getUserFromSession(request)
  if (!accessToken || !email)
    throw redirectToSignin(request, { urlParams: "user=none" })
  // const accessToken = user.credential.accessToken

  const student = await getStudentByEmail(email)
  // const student = user.student as Student
  if (!student || !student.folderLink)
    throw redirectToSignin(request, { urlParams: "student=none" })
  student.users = null

  const url = new URL(request.url)
  const nendoString = url.searchParams.get("nendo")
  const tagString = url.searchParams.get("tags")
  const segmentsString = url.searchParams.get("segments")
  const extensionsString = url.searchParams.get("extensions")

  const promiseData: Promise<{
    nendos: string[]
    // student: Student
    segments: string[]
    extensions: string[]
    tags: string[]
    driveFiles: DriveFile[]
  }> = new Promise(async (resolve, reject) => {
    // Get DriveFileData from DB

    // @todo student.$studentFolderId._index/route.tsx: need to update to google drive
    let driveFiles = await getDriveFiles(
      accessToken,
      `trashed=false and '${studentFolderId}' in parents `,
    )

    // let driveFileData = convertDriveFileData(driveFiles)
    // let driveFileData = await getDriveFileDataByFolderId(studentFolderId)

    // Filter by nendo, tags, segments, extensions
    driveFiles = getFilteredDriveFiles(
      driveFiles || [],
      nendoString,
      tagString,
      segmentsString,
      extensionsString,
    )

    const { nendos, segments, extensions, tags } =
      getNendosSegmentsExtensionsTags(driveFiles, student)

    resolve({
      // student,
      nendos,
      segments,
      extensions,
      tags,
      driveFiles,
    })
  })

  const headers = new Headers()

  headers.set("Cache-Control", `private, max-age=${CACHE_MAX_AGE_SECONDS}`) // 10 minutes

  return defer(
    {
      student,
      tagString,
      url: request.url,
      studentFolderId,
      promiseData,
    },
    {
      headers,
    },
  )
}

// type LoaderData = SerializeFrom<typeof loader>
/**
 * StudentFolderIndexPage Component
 */
export default function StudentFolderIdIndexPage() {
  const navigation = useNavigation()

  const isNavigating =
    navigation.state !== "idle" && !!navigation.location.pathname

  const { studentFolderId, url, promiseData } = useLoaderData<typeof loader>()

  const _url = new URL(url)
  const urlNendo = _url.searchParams.get("nendo") || ""
  const urlSegment = _url.searchParams.get("segments") || ""
  const urlExtension = _url.searchParams.get("extensions") || ""
  const urlTag = _url.searchParams.get("tags") || ""

  let { student } = useLoaderData<typeof loader>()
  let student2 = convertStudent(student)

  // JSX -------------------------
  return (
    <div className="container h-full p-4 mx-auto sm:p-8">
      <div className="mb-4 space-y-2">
        {student2 && <StudentHeader student={student2} />}
      </div>
      <section className="flex flex-col h-full space-y-2">
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
            {({ driveFiles, nendos, tags, extensions, segments }) => {
              const dfd = convertDriveFiles(driveFiles)
              return (
                <>
                  <div className="flex items-center justify-between flex-none">
                    <div className="flex items-center gap-2">
                      <BackButton />
                      <AllPill url={url} studentFolderId={studentFolderId} />
                      <div className={`dropdown self-end `}>
                        <div
                          tabIndex={0}
                          role="button"
                          className={`btn btn-sm bg-sky-400 hover:bg-sky-300 btn-circle avatar ${isNavigating ? " disabled" : ""}`}
                        >
                          <SearchIcon />
                        </div>
                        <ul
                          tabIndex={0}
                          className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-slate-100 bg-opacity-80 rounded-box w-56"
                        >
                          <div className="flex flex-wrap justify-center gap-2">
                            <NendoPills url={url} nendos={nendos} />
                            <ExtensionPills url={url} extensions={extensions} />

                            <TagPills url={url} tags={tags} />

                            <SegmentPills url={url} segments={segments} />
                          </div>
                        </ul>
                      </div>
                    </div>

                    <FileCount driveFiles={dfd} />
                  </div>

                  {(urlNendo || urlSegment || urlExtension || urlTag) && (
                    <div className="flex flex-wrap items-center gap-1 pt-2">
                      <Pill name="年度" text={urlNendo} color={"bg-sky-400"} />
                      <Pill
                        name="単語"
                        text={urlSegment}
                        color={"bg-sfgreen-400"}
                      />
                      <Pill
                        name="タイプ"
                        text={urlExtension}
                        color={"bg-sfyellow-300"}
                      />
                      <Pill name="タグ" text={urlTag} color={"bg-sfred-300"} />
                    </div>
                  )}

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
