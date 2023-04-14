import {
  json,
  redirect,
  type LoaderArgs,
  type ActionArgs,
  type TypedResponse,
} from "@remix-run/node"
import {
  destroyUserSession,
  getUserBaseFromSession,
} from "~/lib/session.server"
import { prisma } from "~/lib/db.server"
import invariant from "tiny-invariant"
import { errorResponse } from "~/lib/utils.server"
import type { UserBase } from "~/types"

// TODO: Do we need this?
export async function loader({ request }: LoaderArgs) {
  if (request.method !== "GET") {
    throw errorResponse("Invalid request method", 400)
  }

  return redirect("/")
}

export async function action({
  request,
}: ActionArgs): Promise<TypedResponse<never> | UserBase> {
  const userBase = await getUserBaseFromSession(request)
  invariant(userBase, "couldn't get userBase")

  const user = await prisma.user.findUnique({
    where: {
      email: userBase.email,
    },
    select: {
      id: true,
      first: true,
      last: true,
      picture: true,
      email: true,
      Credential: {
        select: {
          accessToken: true,
          expiryDate: true,
        },
      },
    },
  })

  if (!user) {
    throw json(
      { errorMessage: "User Data not found" },
      {
        status: 401,
      }
    )
  }

  if (!user.Credential?.expiryDate) {
    throw json(
      { errorMessage: "User Data not found" },
      {
        status: 401,
      }
    )
  }

  const exp = new Date(Number(user.Credential.expiryDate))
  const now = new Date(Date.now())

  // check for expired!!
  if (exp < now) {
    return destroyUserSession(request)
  }

  if (user.Credential?.expiryDate) {
    throw errorResponse("User Data not found", 401)
  }

  return {
    last: user.last,
    first: user.first,
    email: user.email,
    picture: user.picture,
    exp: Number(user.Credential.expiryDate),
  }
}
