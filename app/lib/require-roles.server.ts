import { redirect } from "@remix-run/node"
import type { User } from "~/types"
import { logger } from "./logger"

export async function requireUserRole(user: User) {
  logger.debug("👑 requireUserRole start")

  if (user && !["ADMIN", "USER"].includes(user.role)) {
    throw redirect("/auth/signin?authstate=unauthorized")
  }
}

export async function requireAdminRole(user: User) {
  logger.debug("👑 requireAdminRole start")

  if (user && !["SUPER", "ADMIN"].includes(user.role)) {
    throw redirect("/auth/signin?authstate=unauthorized")
  }
}

// export async function requireUserId(
//   request: Request,
//   { redirectTo }: { redirectTo?: string | null } = {},
// ) {
//   const userId = await getUserId(request)
//   if (!userId) {
//     const requestUrl = new URL(request.url)
//     redirectTo =
//       redirectTo === null
//         ? null
//         : redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`
//     const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null
//     const loginRedirect = ["/login", loginParams?.toString()]
//       .filter(Boolean)
//       .join("?")
//     throw redirect(loginRedirect)
//   }
//   return userId
// }
