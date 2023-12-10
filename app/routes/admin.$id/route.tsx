import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import BackButton from "~/components/BackButton"
import { authenticate } from "~/lib/authenticate.server"
import { logger } from "~/lib/logger"
import { requireAdminRole } from "~/lib/require-roles.server"
import * as userS from "~/lib/user.server"

export default function AdminIdLayoutPage() {
  return (
    <div
      data-name="admin.$id layout"
      className="container mx-auto h-full p-8 pt-14 sm:pt-8"
    >
      <Outlet />
      <div className="flex gap-8 p-4">
        <BackButton />
      </div>
    </div>
  )
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data) {
    const { targetUser } = data
    return [
      {
        title: `${
          targetUser ? `${targetUser.last}${targetUser.first}` : "ADMIN"
        } | SCHOOL HUB`,
      },
    ]
  } else {
    return [{ title: "ADMIN | SCHOOL HUB" }]
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: admin.$id ${request.url}`)
  const { user } = await authenticate(request)
  await requireAdminRole(user)
  const { id } = params

  const targetUser = await userS.getUserById(Number(id))

  return { targetUser }
}
