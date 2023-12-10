import { redirect } from "@remix-run/node"
import type { User } from "~/types"
import { logger } from "./logger"

export async function requireUserRole(user: User) {
  logger.debug("👑 requireUserRole start")

  if (user && !["ADMIN", "USER"].includes(user.role)) {
    throw redirect("/?authstate=unauthorized")
  }
}

export async function requireAdminRole(user: User) {
  logger.debug("👑 requireAdminRole start")

  if (user && !["SUPER", "ADMIN"].includes(user.role)) {
    throw redirect("/?authstate=unauthorized")
  }
}
