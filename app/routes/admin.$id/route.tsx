import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"

import { logger } from "~/lib/logger"

import { requireAdminRole } from "~/lib/require-roles.server"
import { getUserFromSession } from "~/lib/services/session.server"
import * as userS from "~/lib/services/user.server"

import BackButton from "~/components/back-button"
import { redirectToSignin } from "~/lib/responses"

export default function AdminIdLayoutPage() {
  return (
    <div
      data-name="admin.$id layout"
      className="container h-full p-8 mx-auto pt-14 sm:pt-8"
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
    const {
      targetUser: { user, refreshUser },
    } = data
    const last = user?.last
      ? user.last
      : refreshUser?.last
        ? refreshUser.last
        : null
    const first = user?.first
      ? user.first
      : refreshUser?.first
        ? refreshUser.first
        : null

    return [
      {
        title: `${last && first ? `${last}${first}` : "ADMIN"} | SCHOOL HUB`,
      },
    ]
  } else {
    return [{ title: "ADMIN | SCHOOL HUB" }]
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: admin.$id ${request.url}`)
  const { user } = await getUserFromSession(request)
  if (!user || !user.credential) throw redirectToSignin(request)

  await requireAdminRole(request, user)
  const { id } = params

  const targetUser = await userS.getUserById(Number(id))

  return { targetUser }
}
