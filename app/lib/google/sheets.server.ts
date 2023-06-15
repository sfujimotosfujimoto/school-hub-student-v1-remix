import { google, type sheets_v4 } from "googleapis"
import invariant from "tiny-invariant"
import type { StudentData, UserWithCredentials } from "~/types"
import { getFolderId } from "../utils"
import { getClient } from "./google.server"
import jsondata from "../../data/studentdata.json"

/*********************************************************
 * # getSheets()
 * - gets Drive instance
 */
export async function getSheets(
  accessToken: string
): Promise<sheets_v4.Sheets | null> {
  const client = await getClient(accessToken)

  if (client) {
    const sheets = google.sheets({
      version: "v4",
      auth: client,
    })
    return sheets
  }
  return null
}

export async function getStudentData(user: UserWithCredentials) {
  invariant(user.Credential, "Unauthorized google account")

  const studentEmail = user.email.replace(/^p/, "b")

  let student = jsondata.find((d) => d.email === studentEmail)

  return student
}

export async function getStudentDataByEmail(email: string) {
  const studentEmail = email.replace(/^p/, "b")
  let student = jsondata.find((d) => d.email === studentEmail)
  return student
}

export function getStudentByFolderId(
  folderId: string,
  studentData: StudentData[]
): StudentData | null {
  const studentD = studentData.find(
    (d) => d.folderLink && folderId === getFolderId(d.folderLink)
  )

  if (studentD) return studentD

  return null
}
