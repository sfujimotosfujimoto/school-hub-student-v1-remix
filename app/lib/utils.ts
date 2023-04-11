import type { StudentData } from "~/types"

export function filterStudentDataByGakunen(
  gakunen: string,
  hr: string,
  studentData: StudentData[]
) {
  if (gakunen === "ALL" && hr === "ALL") {
    return studentData
  } else if (gakunen === "ALL") {
    return studentData.filter((sd) => sd.hr === hr)
  } else if (hr === "ALL") {
    return studentData.filter((sd) => sd.gakunen === gakunen)
  } else {
    return studentData.filter((sd) => sd.gakunen === gakunen && sd.hr === hr)
  }
}

export function getStudentEmail(email: string) {
  const regex = RegExp(
    /(b[0-9]{5,}@seig-boys.jp|samples[0-9]{2}@seig-boys.jp)/
    // /(b[0-9]{5,}@seig-boys.jp|samples[0-9]{2}@seig-boys.jp|s-tamaki@seig-boys.jp)/
  )

  const matches = email.match(regex)

  if (!matches) return null
  return matches[0]
}

export function getFolderId(folderUrl: string): string | null {
  if (!folderUrl) return null
  const output = String(folderUrl).split("/").at(-1)
  if (!output) return null
  return output
}
