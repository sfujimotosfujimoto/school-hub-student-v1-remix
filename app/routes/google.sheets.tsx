import { json, type LoaderArgs } from "@remix-run/node"
import { getEmailFromSession } from "~/data/auth.server"
import { prisma } from "~/data/database.server"
import { getStudentDataResponse } from "~/data/google.server"

export async function loader({ request }: LoaderArgs) {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 })
  }

  const email = await getEmailFromSession(request)

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      first: true,
      last: true,

      email: true,
      Credential: {
        select: {
          accessToken: true,
          idToken: true,
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
