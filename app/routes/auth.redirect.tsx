import { json, type LoaderArgs } from "@remix-run/node"
import { signin } from "~/data/signin.server"

export async function loader({ request }: LoaderArgs) {
  if (request.method !== "GET") {
    throw json({ message: "Invalid request method" }, { status: 400 })
  }

  const parsedUrl = new URL(request.url)
  const code = parsedUrl.searchParams.get("code")

  // if no "code" , do not touch and resolve
  if (!code)
    throw new Response("You are not authorized", {
      status: 401,
      statusText:
        "You are not authorized. Get permission from admin s-fujimoto@seig-boys.jp.",
    })

  return signin({ code })
}

export default function Redirect() {
  return <div>Redirect</div>
}
