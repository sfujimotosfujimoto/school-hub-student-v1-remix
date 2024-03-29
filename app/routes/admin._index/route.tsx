import { useLoaderData } from "@remix-run/react"
import type { LoaderFunctionArgs } from "@remix-run/node"

import type { User } from "~/types"
import { UsersSchema } from "~/types/schemas"
import { logger } from "~/lib/logger"

import { requireAdminRole } from "~/lib/require-roles.server"
import { getUsers } from "~/lib/services/user.server"
import { getSession } from "~/lib/services/session.server"

import Tables from "./tables"
import { redirectToSignin } from "~/lib/responses"

/**
 * LOADER function
 */
export async function loader({ request }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: admin._index ${request.url}`)
  const { accessToken, role } = await getSession(request)
  // const { user } = await getUserFromSession(request)
  if (!accessToken || !role) {
    throw redirectToSignin(request)
  }
  await requireAdminRole(request, role)

  const users = await getUsers()
  return { users }
}

/**
 * Component
 */
export default function AdminIndexPage() {
  const { users } = useLoaderData<typeof loader>()

  const result = UsersSchema.safeParse(users)
  let resultUsers: User[] | null = null
  if (result.success) {
    resultUsers = result.data || null
  } else {
    // console.log("🚨 UsersSchema", result.error)
  }

  // const user = rawUserToUser(targetUser)

  return (
    <section
      data-name="admin._index"
      className="w-full max-w-5xl p-4 mx-auto overflow-x-auto"
    >
      <div className="mx-auto max-h-[calc(100dvh-200px)] w-full overflow-x-auto">
        {!users && <h1>NO DATA</h1>}
        {users && resultUsers && <Tables users={resultUsers} />}
      </div>
    </section>
  )
}
