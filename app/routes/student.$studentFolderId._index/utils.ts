import { filterSegments, parseTags } from "~/lib/utils"
import type { DriveFile, Student } from "~/types"

export function getFilteredDriveFiles(
  driveFiles: DriveFile[],
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
    driveFiles.sort((a, b) => {
      const atime = a.modifiedTime ? a.modifiedTime.getTime() : 0
      const btime = b.modifiedTime ? b.modifiedTime.getTime() : 0
      return btime - atime
    }) || []
  )
}

export function getNendosSegmentsExtensionsTags(
  driveFiles: DriveFile[],
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
