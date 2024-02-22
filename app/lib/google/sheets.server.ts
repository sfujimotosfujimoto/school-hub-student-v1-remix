import invariant from "tiny-invariant"
import { getServiceAccountClient } from "./google.server"
import { createClient } from "@vercel/kv"
import { logger } from "../logger"
import { google } from "googleapis"
import type { Student } from "~/types"

const KV_EXPIRE_SECONDS = 60

export async function getStudentByEmail(
  email: string,
): Promise<Student | undefined> {
  const studentData = await getStudentDataWithServiceAccount()

  if (!studentData) return undefined
  const studentEmail = email.replace(/^p/, "b")

  const student = studentData.find((d) => d.email === studentEmail)
  return student
}

// export function getStudentByFolderId(
//   folderId: string,
//   studentData: Student[],
// ): Student | null {
//   const studentD = studentData.find(
//     (d) => d.folderLink && folderId === getFolderId(d.folderLink),
//   )

//   if (studentD) return studentD

//   return null
// }

async function getSheetsWithServiceAccount() {
  const client = await getServiceAccountClient()
  if (!client) return null

  const sheets = google.sheets({
    version: "v4",
    auth: client,
  })
  return sheets
}

export async function getStudentDataWithServiceAccount() {
  try {
    const sheets = await getSheetsWithServiceAccount()
    invariant(sheets, "Unauthorized google account")

    let studentData: Student[]

    const kv = createClient({
      url: process.env.KV_V1S_REST_API_URL || "",
      token: process.env.KV_V1S_REST_API_TOKEN || "",
    })

    if (!kv) throw new Error("Could not create KV client")

    const cache = await kv.get<Student[] | null>("studentData")

    if (cache) {
      logger.info("🎁 cache hit")
      studentData = cache
    } else {
      logger.info("🎁 no cache")

      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_API_MEIBO_SHEET_URI,
        range: "MEIBO!A2:J916",
        valueRenderOption: "UNFORMATTED_VALUE",
      })
      const data = resp.data.values
      if (!data || data.length === 0) {
        throw new Error(`Could not get data"`)
      }

      studentData = data.map((d) => {
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
          users: [],
          createdAt: new Date(),
          expiry: new Date(),
        }
      })

      if (data) {
        await kv.set("studentData", studentData, { ex: KV_EXPIRE_SECONDS })
      }
    }

    return studentData
  } catch (err) {
    console.error(`sheets.server.ts: ${err}`)
    // throw Error(`Something went wrong getting data from spreadsheet. ${err}`)
    return []
  }
}
