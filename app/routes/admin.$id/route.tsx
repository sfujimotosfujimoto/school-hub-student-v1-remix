import type { V2_MetaFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/node"
import React from "react"
import BackButton from "~/components/BackButton"
import { getUserById, requireAdminRole } from "~/lib/user.server"

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

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
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

export async function loader({ request, params }: LoaderArgs) {
  await requireAdminRole(request)
  const { id } = params

  const targetUser = await getUserById(Number(id))

  return { targetUser }
}
