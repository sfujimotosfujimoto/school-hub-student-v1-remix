import { json } from "@remix-run/node"
import type { UserWithCredentials } from "~/types"
import { getStudentData } from "./google/sheets.server"

export async function getStudentDataResponse(user: UserWithCredentials) {
  try {
    const studentData = await getStudentData(user)
    return json({ studentData })
  } catch (error) {
    throw new Response("Unauthorized google account", {
      status: 403,
      statusText: `You are not authorized to the spreadsheet.`,
    })
  }
}
