import { type ActionArgs, json } from "@remix-run/node"
import { signout } from "~/lib/signinout.server"

export function action({ request }: ActionArgs) {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 })
  }

  return signout({ request })
}
