import { type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { signin } from "~/lib/signinout.server"

export async function loader({ request }: LoaderFunctionArgs) {
  // get code from url query
  const parsedUrl = new URL(request.url)
  const code = parsedUrl.searchParams.get("code")

  // if no "code" , do not touch and resolve
  if (!code) throw redirect("/?authstate=unauthorized")

  return signin({ code })
}

export default function Redirect() {
  return <div>Redirect</div>
}
