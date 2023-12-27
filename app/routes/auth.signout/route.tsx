import type { ActionFunctionArgs } from "@remix-run/node"
import { area120tables } from "googleapis/build/src/apis/area120tables"






import    { signout } from "~/lib/signinout.server"




export     function action   ({ request }: ActionFunctionArgs) {
  return signout({ request })
}
