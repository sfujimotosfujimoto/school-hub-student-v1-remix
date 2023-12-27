import type { User } from "~/types"
import { logger } from "./logger"
import { redirectToSignin } from "./responses"

export async function requireUserRole(user: User) {
  logger.debug("👑 requireUserRole start")

  if (user && !["ADMIN", "USER"].includes(user.role)) {
    redirectToSignin()
    // throw redirect("/auth/signin?authstate=unauthorized")
  }
}

export async function requireAdminRole(user: User) {
  logger.debug("👑 requireAdminRole start")

  if (user && !["SUPER", "ADMIN"].includes(user.role)) {
    redirectToSignin()
    // throw redirect("/auth/signin?authstate=unauthorized")
  }
}
