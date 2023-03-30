import { json, redirect, type LoaderArgs } from "@remix-run/node"
import { signin } from "~/data/session.server"

export async function loader({ request }: LoaderArgs) {
  if (request.method !== "GET") {
    throw json({ message: "Invalid request method" }, { status: 400 })
  }

  const parsedUrl = new URL(request.url)
  const code = parsedUrl.searchParams.get("code")

  // if no "code" , do not touch and resolve
  if (!code) return redirect("/")

  return signin({ code })
}
