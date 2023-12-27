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
  const user = await getUserFromSession(request)
  if (!user || !user.credential)
    throw redirectToSignin(
      `/auth/signin?redirect=${encodeURI(new URL(request.url).href)}`,
    )

  await requireAdminRole(user)
  const { id } = params

  const targetUser = await userS.getUserById(Number(id))

  return { targetUser }
}
