import { useLoaderData } from "@remix-run/react"
import type { LoaderFunctionArgs } from "@remix-run/node"

import { UserSchema } from "~/schemas"

import { getUserFromSession } from "~/lib/services/session.server"
import * as userS from "~/lib/services/user.server"
import { logger } from "~/lib/logger"
import { requireAdminRole } from "~/lib/require-roles.server"

import AdminCard from "../auth.signin/admin-card"
import { redirectToSignin } from "~/lib/responses"

export default function AdminIdIndexPage() {
  let { targetUser } = useLoaderData<typeof loader>()

  if (!targetUser) throw Error("No user found")
  const result = UserSchema.safeParse(targetUser)

  if (!result.success) {
    console.error(`🚨 ${result.error}`)
    throw new Error(result.error.message)
  }

  const user = result.data

  return (
    <article
      data-name="admin.$id._index"
      className="mx-auto w-full max-w-xl rounded-md border-4 border-sfgreen-200 bg-slate-50 p-8"
    >
      <div className="grid grid-cols-1 place-content-center">
        {user && <AdminCard user={user} />}
      </div>
    </article>
  )
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: admin.$id._index ${request.url}`)
  const user = await getUserFromSession(request)
  if (!user || !user.credential)
    throw redirectToSignin(
      `/auth/signin?redirect=${encodeURI(new URL(request.url).href)}`,
    )
  await requireAdminRole(user)
  const { id } = params

  const targetUser = await userS.getUserById(Number(id))

  return {
    targetUser,
  }
}
