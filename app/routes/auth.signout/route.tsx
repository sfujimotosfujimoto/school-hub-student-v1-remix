import type { ActionFunctionArgs } from "@remix-run/node"
import { signout } from "~/lib/signinout.server"

export function action({ request }: ActionFunctionArgs) {
  return signout({ request })
}
