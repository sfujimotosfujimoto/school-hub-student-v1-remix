import type { LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import * as userS from "~/lib/user.server"
import AdminCard from "./AdminCard"
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
  await userS.requireAdminRole(request)
  const { id } = params

  const targetUser = await userS.getUserById(Number(id))

  return {
    targetUser,
  }
}
