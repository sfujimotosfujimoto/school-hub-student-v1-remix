import type { ActionFunctionArgs } from "@remix-run/node"
import { signout } from "~/lib/services/signinout.server"

export function action({ request }: ActionFunctionArgs) {
  return signout({ request })
}
