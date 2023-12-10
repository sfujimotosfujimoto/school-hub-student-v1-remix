import { logger } from "./logger"

// Check expiration
export function isExpired(expire: number): boolean {
  if (expire < 10_000_000_000 && expire > 0)
    throw Error(`expire is incorrect: ${expire}`)
  logger.info(
    `🍇 isExpired: ${expire < Date.now()}, expire ${new Date(
      expire,
    ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}, now ${new Date(
      Date.now(),
    ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
  )

  const now = Date.now()

  // check for expired!!
  if (expire < now) {
    return true
  } else {
    return false
  }
}
