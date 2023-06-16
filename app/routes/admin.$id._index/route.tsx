import type { LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import React from "react"
import { getUserById, requireAdminRole } from "~/lib/user.server"
import AdminCard from "./AdminCard"
import type { User } from "~/types"
import { rawUserToUser } from "~/lib/utils"

export default function AdminIdIndexPage() {
  let { targetUser } = useLoaderData<typeof loader>()

  if (!targetUser) throw Error("No user found")
  const user = rawUserToUser(targetUser)

  return (
    <article
      data-name="admin.$id._index"
      className="w-full max-w-xl p-8 mx-auto border-4 rounded-md border-sfgreen-200 bg-slate-50"
    >
      <div className="grid grid-cols-1 place-content-center">
        {user && <AdminCard user={user} />}
      </div>
    </article>
  )
}

export async function loader({ request, params }: LoaderArgs) {
  await requireAdminRole(request)
  const { id } = params

  const targetUser = await getUserById(Number(id))

  return {
    targetUser,
  }
}
