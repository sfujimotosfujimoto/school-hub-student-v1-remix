import { google, type sheets_v4 } from "googleapis"
import invariant from "tiny-invariant"
import type { StudentData, User } from "~/types"
import { getFolderId } from "../utils"
import { getClient, getServiceAccountClient } from "./google.server"
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

export async function getStudentData(user: User) {
  invariant(user.credential, "Unauthorized google account")

  const studentEmail = user.email.replace(/^p/, "b")

  let student = jsondata.find((d) => d.email === studentEmail)

  return student
}

export async function getStudentDatumByEmail(
  email: string
): Promise<StudentData | undefined> {
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

async function getSheetsWithServiceAccount() {
  // console.log('🚀 server/sheets.server.ts ~ 	😀 in getSheetsWithServiceAccount')
  const client = await getServiceAccountClient()
  if (!client) return null

  const sheets = google.sheets({
    version: "v4",
    auth: client,
  })
  return sheets
}

export async function getStudentDataWithServiceAccount() {
  // console.log(
  // "🚀 server/sheets.server.ts ~ getStudentDataWithServiceAccount in"
  // )

  try {
    // console.log("🚀 server/sheets.server.ts ~ 	😀 before sheets")
    const sheets = await getSheetsWithServiceAccount()
    invariant(sheets, "Unauthorized google account")
    // console.log("🚀 server/sheets.server.ts ~ 	🌈 sheets ✨ ", sheets)

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_API_MEIBO_SHEET_URI,
      range: "MEIBO!A2:J916",
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    // console.log("🚀 server/sheets.server.ts ~ 	🌈 resp ✨ ", resp)

    const data = resp.data.values
    // console.log("🚀 server/sheets.server.ts ~ 	🌈 data ✨ ", data)

    if (!data || data.length === 0) {
      throw new Error(`Could not get data"`)
    }

    const studentData: StudentData[] = data.map((d) => {
      return {
        gakuseki: (d[0] || 0) as number,
        gakunen: d[1] as string,
        hr: d[2] as string,
        hrNo: Number(d[3]) as number,
        last: d[4] as string,
        first: d[5] as string,
        sei: d[6] as string,
        mei: d[7] as string,
        email: d[8] as string,
        folderLink: (d[9] || null) as string | null,
      }
    })
    return studentData
  } catch (err) {
    console.error(`sheets.server.ts: ${err}`)
    // throw Error(`Something went wrong getting data from spreadsheet. ${err}`)
    return []
  }
}
