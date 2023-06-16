import { json, type ActionArgs } from "@remix-run/node"
import { getStudentDataWithServiceAccount } from "~/lib/google/sheets.server"

export async function action({ request }: ActionArgs) {
  console.log("🚀 student-data/route.tsx ~ 	😀 in action")
  const studentData = await getStudentDataWithServiceAccount()

  return json({ studentData })
}
