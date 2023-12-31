import { logger } from "./logger"

// Check expiration
export function isExpired(expire: Date): boolean {
  if (expire.getTime() < 10_000_000_000 && expire.getTime() > 0)
    throw Error(`expire is incorrect: ${expire}`)
  logger.info(
    `🍇 isExpired: ${expire.getTime() < Date.now()}, expire ${new Date(
      expire,
    ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}, now ${new Date(
      Date.now(),
    ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
  )

  const now = Date.now()

  // check for expired!!
  if (expire.getTime() < now) {
    return true
  } else {
    return false
  }
}
