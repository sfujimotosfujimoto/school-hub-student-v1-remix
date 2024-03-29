import type { DriveFileData, Student } from "~/types"

export function dateFormat(dateString: string | number) {
  const date = new Date(dateString)

  const output = new Intl.DateTimeFormat("ja", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)

  return output
}

export function getFolderId(folderUrl: string): string | null {
  if (!folderUrl) return null
  const output = String(folderUrl).split("/").at(-1)
  if (!output) return null
  return output
}

// used in student.$studentFolderId.tsx
export function filterSegments(
  segments: string[],
  student?: Omit<Student, "users"> | null,
) {
  const regex = RegExp(
    `${student?.last}|${student?.first}|${student?.gakuseki}|([ABCDE]+\\d+)|([ABCDE]組\\d+番)|^\\d+$|pdf|png|jpg|jpeg`,
    "g",
  )

  return segments.filter((seg) => !seg.match(regex))
}

export function filterStudentDataByGakunen(
  gakunen: string,
  hr: string,
  studentData: Student[],
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
  const regex = RegExp(/(b[0-9]{5,}@seig-boys.jp|samples[0-9]{2}@seig-boys.jp)/)

  const matches = email.match(regex)

  if (!matches) return null
  return matches[0]
}

export function checkValidStudentOrParentEmail(email: string) {
  const regex = RegExp(
    /([pb][0-9]{5,}@seig-boys.jp|samples[0-9]{2}@seig-boys.jp)/,
    // /(b[0-9]{5,}@seig-boys.jp|samples[0-9]{2}@seig-boys.jp|s-tamaki@seig-boys.jp)/
  )

  // use regex to get student address
  const matches = email.match(regex)
  if (matches) {
    return true
  } else {
    return false
  }
}

export function checkValidAdminEmail(email: string) {
  const regex = RegExp(
    /(s-fujimoto@seig-boys.jp)/,
    // /(b[0-9]{5,}@seig-boys.jp|samples[0-9]{2}@seig-boys.jp|s-tamaki@seig-boys.jp)/
  )

  // use regex to get student address
  const matches = email.match(regex)
  if (matches) {
    return true
  } else {
    return false
  }
}

export function checkValidStudentSeigEmail(email: string) {
  const regex = RegExp(
    /([a-z]{1}[0-9]{1,9}@seig-boys.jp)/,
    // /(b[0-9]{5,}@seig-boys.jp|samples[0-9]{2}@seig-boys.jp|s-tamaki@seig-boys.jp)/
  )

  // use regex to get student address
  const matches = email.match(regex)
  if (matches) {
    return true
  } else {
    return false
  }
}

export function stripText(name: string) {
  const regex = /^b*([0-9]{1,8}_)|b([0-9]{1,8}_)/g
  const str = name.replace(regex, "")
  if (str) return str
  return null
}

export function checkGoogleMimeType(rowData: DriveFileData) {
  const regex = RegExp(/^application\/vnd\.google-apps.*/)

  const matches = rowData.mimeType.match(regex)

  if (matches) return true
  else return false
}

export function formatDate(date: Date, locals = "ja-JP") {
  const formatter = Intl.DateTimeFormat(locals, {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  })

  return formatter.format(date)
}

export function parseTags(genres: string) {
  return genres.split(",").map((g) => g.trim())
}

export function toLocaleString(date: Date | number | string) {
  return new Date(date).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
}
