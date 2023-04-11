import { google, type sheets_v4 } from "googleapis"
import invariant from "tiny-invariant"
import type { StudentData, UserWithCredentials } from "~/types"
import { getFolderId } from "../utils"
import { getClient } from "./google.server"

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

  const sheets = await getSheets(user.Credential.accessToken)
  invariant(sheets, "Unauthorized google account")

  const meiboSheetId = process.env.GOOGLE_API_MEIBO_SHEET_URI
  invariant(meiboSheetId, "No meibo sheet id")

  try {
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: meiboSheetId,
      range: "MEIBO!A2:J916",
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    const data = resp.data.values

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
    throw Error(`Something went wrong getting data from spreadsheet. ${err}`)
  }
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
