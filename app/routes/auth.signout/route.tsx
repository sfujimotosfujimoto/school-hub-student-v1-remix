
🌼   daisyUI 4.4.24
├─ ✔︎ 1 theme added		https://daisyui.com/docs/themes
╰─ ★ Star daisyUI on GitHub	https://github.com/saadeghi/daisyui

// todo
import type { ActionFunctionArgs } from "@remix-run/node"
import { signout } from "~/lib/signinout.server"

export function action({ request }: ActionFunctionArgs) {
  return signout({ request })
}
