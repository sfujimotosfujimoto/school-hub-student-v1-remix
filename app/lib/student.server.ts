import { json } from "@remix-run/node"
import type { StudentData, User } from "~/types"
import { getStudentData } from "./google/sheets.server"

export async function getStudentDataResponse(user: User) {
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

export async function getStudentDatumByEmail2(
  studentData: StudentData[],
  userEmail: string
): Promise<StudentData | undefined> {
  if (!studentData) return undefined
  const studentEmail = userEmail.replace(/^p/, "b")

  const student = studentData.find((d) => d.email === studentEmail)
  return student
}
