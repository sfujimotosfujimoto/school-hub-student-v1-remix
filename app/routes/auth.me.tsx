import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from "@remix-run/node"
import { destroyUserSession, getEmailFromSession } from "~/data/auth.server"
import * as jose from "jose"
import type { IdToken } from "~/types"
import { prisma } from "~/data/database.server"

export async function loader({ request }: LoaderArgs) {
  if (request.method !== "GET") {
    throw json({ message: "Invalid request method" }, { status: 400 })
  }

  return redirect("/")

  // const email = await getEmailFromSession(request)

  // const user = await prisma.user.findUnique({
  //   where: {
  //     email,
  //   },
  //   select: {
  //     id: true,
  //     first: true,
  //     last: true,

  //     email: true,
  //     Credential: {
  //       select: {
  //         accessToken: true,
  //         idToken: true,
  //         expiryDate: true,
  //       },
  //     },
  //   },
  // })

  // if (!user) {
  //   return json(
  //     { errorMessage: "User Data not found" },
  //     {
  //       status: 401,
  //     }
  //   )
  // }

  // if (!user.Credential?.expiryDate) {
  //   return json(
  //     { errorMessage: "User Data not found" },
  //     {
  //       status: 401,
  //     }
  //   )
  // }
  // const exp = new Date(Number(user.Credential.expiryDate))
  // const now = new Date(Date.now())

  // // check for expired!!
  // if (exp < now) {
  //   return destroyUserSession(request)
  // }

  // if (user.Credential?.expiryDate)
  //   if (!user.Credential?.idToken) {
  //     return json(
  //       { errorMessage: "User Data not found" },
  //       {
  //         status: 401,
  //       }
  //     )
  //   }
  // const idToken = jose.decodeJwt(user.Credential.idToken) as IdToken

  // return {
  //   last: idToken.family_name,
  //   first: idToken.given_name,
  //   email: idToken.email,
  //   picture: idToken.picture,
  //   exp: idToken.exp,
  // }
}

export async function action({ request }: ActionArgs) {
  console.log("🚀 routes/auth.me.tsx ~ 	🌈 request ✨ ")

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

  if (!user) {
    return json(
      { errorMessage: "User Data not found" },
      {
        status: 401,
      }
    )
  }

  if (!user.Credential?.expiryDate) {
    return json(
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

  if (user.Credential?.expiryDate)
    if (!user.Credential?.idToken) {
      return json(
        { errorMessage: "User Data not found" },
        {
          status: 401,
        }
      )
    }
  const idToken = jose.decodeJwt(user.Credential.idToken) as IdToken

  return {
    last: idToken.family_name,
    first: idToken.given_name,
    email: idToken.email,
    picture: idToken.picture,
    exp: idToken.exp,
  }
}
