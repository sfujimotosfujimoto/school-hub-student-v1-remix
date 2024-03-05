import { logger } from "./logger"
import { redirectToSignin } from "./responses"

export async function requireUserRole(request: Request, role: string) {
  logger.debug("👑 requireUserRole start")

  if (!["ADMIN", "USER"].includes(role)) {
    redirectToSignin(request)
  }
}

export async function requireAdminRole(request: Request, role: string) {
  if (!["SUPER", "ADMIN"].includes(role)) {
    redirectToSignin(request)
  }
}
