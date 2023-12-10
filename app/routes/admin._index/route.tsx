import { useLoaderData } from "@remix-run/react"
import Tables from "./Tables"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { logger } from "~/lib/logger"
import { authenticate } from "~/lib/authenticate.server"
import { requireAdminRole } from "~/lib/require-roles.server"
import type { User } from "~/types"
import { UsersSchema } from "~/schemas"
import { getUsers } from "~/lib/user.server"

/**
 * LOADER function
 */
export async function loader({ request }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: admin._index ${request.url}`)
  const { user } = await authenticate(request)
  await requireAdminRole(user)

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
  }

  // const user = rawUserToUser(targetUser)

  return (
    <section
      data-name="admin._index"
      className="mx-auto w-full max-w-5xl overflow-x-auto p-4"
    >
      <div className="mx-auto max-h-[calc(100dvh-200px)] w-full overflow-x-auto">
        {!users && <h1>NO DATA</h1>}
        {users && resultUsers && <Tables users={resultUsers} />}
      </div>
    </section>
  )
}
