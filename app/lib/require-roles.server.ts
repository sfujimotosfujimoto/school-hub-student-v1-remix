import type { User } from "~/type.d"
import { logger } from "./logger"
import { redirectToSignin } from "./responses"

export async function requireUserRole(request: Request, user: User) {
  logger.debug("👑 requireUserRole start")

  if (user && !["ADMIN", "USER"].includes(user.role)) {
    redirectToSignin(request)
    // throw redirect("/auth/signin?authstate=unauthorized")
  }
}

export async function requireAdminRole(request: Request, user: User) {
  logger.debug("👑 requireAdminRole start")

  if (user && !["SUPER", "ADMIN"].includes(user.role)) {
    redirectToSignin(request)
    // throw redirect("/auth/signin?authstate=unauthorized")
  }
}
