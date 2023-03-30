import { destroyUserSession } from "~/data/session.server"

import { type ActionArgs, json } from "@remix-run/node"

export function action({ request }: ActionArgs) {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 })
  }

  return destroyUserSession(request)
}
