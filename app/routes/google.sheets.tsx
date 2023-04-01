import { json, type LoaderArgs } from "@remix-run/node"
import { getUserBaseFromSession } from "~/data/session.server"
import { prisma } from "~/data/db.server"
import { getStudentDataResponse } from "~/data/google.server"
import invariant from "tiny-invariant"

export async function loader({ request }: LoaderArgs) {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 })
  }

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

      email: true,
      Credential: {
        select: {
          accessToken: true,
          expiryDate: true,
        },
      },
    },
  })

  if (!user || !user.Credential) {
    return json(
      { errorMessage: "User Data not found" },
      {
        status: 401,
      }
    )
  }

  return getStudentDataResponse(user)
}
