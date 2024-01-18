import { logger } from "./logger"
import { toLocaleString } from "~/lib/utils"

// Check expiration
export function isExpired(expire: Date): boolean {
  if (expire.getTime() < 10_000_000_000 && expire.getTime() > 0)
    throw Error(`expire is incorrect: ${expire}`)
  logger.info(
    `🍇 isExpired: ${expire.getTime() < Date.now()}, expire ${toLocaleString(
      expire,
    )}, now ${toLocaleString(Date.now())}`,
  )

  const now = Date.now()

  // check for expired!!
  if (expire.getTime() < now) {
    return true
  } else {
    return false
  }
}
