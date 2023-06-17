import type { LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import React from "react"
import { getUsers, requireAdminRole } from "~/lib/user.server"
import Tables from "./Tables"
export default function AdminIndexPage() {
  const { users } = useLoaderData()

  return (
    <section
      data-name="admin._index"
      className="w-full max-w-5xl p-4 mx-auto overflow-x-auto"
    >
      <div className="mx-auto max-h-[calc(100dvh-200px)] w-full overflow-x-auto">
        {!users && <h1>NO DATA</h1>}
        {users && <Tables users={users} />}
      </div>
    </section>
  )
}

export async function loader({ request }: LoaderArgs) {
  await requireAdminRole(request)

  const users = await getUsers()
  return { users }
}
