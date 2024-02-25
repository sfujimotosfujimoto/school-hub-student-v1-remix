import type { User } from "~/types"
import { logger } from "./logger"
import { redirectToSignin } from "./responses"

export async function requireUserRole(request: Request, user: User) {
  logger.debug("👑 requireUserRole start")

  if (user && !["ADMIN", "USER"].includes(user.role)) {
    redirectToSignin(request)
  }
}

export async function requireAdminRole(request: Request, user: User) {
  if (user && !["SUPER", "ADMIN"].includes(user.role)) {
    redirectToSignin(request)
  }
}
