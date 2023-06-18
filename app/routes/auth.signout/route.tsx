import { type ActionArgs } from "@remix-run/node"
import { signout } from "~/lib/signinout.server"

export function action({ request }: ActionArgs) {
  return signout({ request })
}
