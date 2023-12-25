import type { User } from "~/types"

import {
  getUserJWTFromSession,
  parseVerifyUserJWT,
  sessionStorage,
} from "./services/session.server"
import { getUserByEmail, returnUser } from "./services/user.server"
import { isExpired } from "./utils.server"
import { redirect } from "@remix-run/node"
import { logger } from "./logger"

class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthorizationError"
  }
}

/**
 * authenticate
 * 1. get session from cookies
 * 2. parse end verify userJWT (checks if expired)
 * 3. get user from session
 * 4-1. if rexp expired, return error
 * 4-2. if exp expired, try to refresh token
 * 4-2-1. fetch endpoint to refresh token
 * 4-2-2. updated payload
 * 5. return user
 *
 */
export async function authenticate(
  request: Request,
  headers = new Headers(),
): Promise<{ user: User; userJWT: string }> {
  logger.info(`👑 authenticate: start - ${new URL(request.url).pathname}`)

  // get data from session
  const userJWT = await getUserJWTFromSession(request)
  // if not found, redirect to /, this means the user is not even logged-in
  if (!userJWT) {
    throw redirect("/auth/signin?authstate=unauthorized")
  }
  // if expired throw an error (we can extends Error to create this)
  const payload = await parseVerifyUserJWT(userJWT)
  if (!payload) {
    throw redirect("/auth/signin?authstate=unauthorized")
  }

  // get user from session
  const user = await getUserByEmail(payload.email)
  if (!user) {
    throw redirect("/auth/signin?authstate=unauthorized")
  }

  try {
    logger.debug(`👑 authenticate: 1. expExpired`)
    const expExpired = isExpired(payload.exp)
    logger.debug(`👑 authenticate: 2. rexpExpired`)
    const rexpExpired = isExpired(payload.rexp)

    // 4-1. if rexp expired, return error
    if (rexpExpired) {
      logger.debug("👑 authenticate: in rexpExpired")

      // update the session with the new values
      const session = await sessionStorage.getSession()
      // commit the session and append the Set-Cookie header
      headers.append("Set-Cookie", await sessionStorage.destroySession(session))

      // redirect to the same URL if the request was a GET (loader)
      if (request.method === "GET") {
        logger.debug("👑 authenticate: request GET redirect for rexpExpired")
        throw redirect("/auth/signin?authstate=unauthorized-rexpExpired", {
          headers,
        })
      }

      // throw redirect("/?authstate=unauthorized-rexpExpired")
    } else if (expExpired) {
      // 4-2. if exp expired, try to refresh token
      logger.debug("👑 authenticate: expired")
      throw new AuthorizationError("exp is expired")
    }

    // if not expired, return the access token
    logger.debug("👑 authenticate: not expired")
    return { user, userJWT }
  } catch (error) {
    // here, check if the error is an AuthorizationError (the one we throw above)
    if (error instanceof AuthorizationError) {
      // if AuthorizationError,  refresh the token somehow, this depends on the API you are using
      // 4-2-1. fetch endpoint to refresh token
      const jsn = await fetch(`${process.env.BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user,
          email: payload.email,
          accessToken: user.credential?.accessToken,
          refreshToken: user.credential?.refreshToken,
        }),
      })
        .then((res) => {
          logger.debug("👑 authenticate: fetch res")
          return res.json()
        })
        .catch((err) => {
          console.error(`❌ authenticate: fetch error`, err.message, err)
          return { error: "error in fetch" }
        })

      logger.info(
        `👑 authenticate: expiry: ${new Date(
          Number(jsn.data.user.credential.expiry || 0),
        ).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
      )
      if (!jsn.ok) {
        throw redirect("/auth/signin?authstate=unauthorized-refresherror")
      }
      // update the session with the new values
      const session = await sessionStorage.getSession()
      session.set("userJWT", jsn.data.userJWT)
      // commit the session and append the Set-Cookie header
      headers.append("Set-Cookie", await sessionStorage.commitSession(session))

      // redirect to the same URL if the request was a GET (loader)
      if (request.method === "GET") {
        logger.debug("👑 authenticate: request GET redirect")
        throw redirect(request.url, { headers })
      }

      // return the access token so you can use it in your action
      // return jsn.data.userJWT
      const newUser = returnUser(jsn.data.user)
      logger.info(`👑 authenticate: ${newUser.last} ${newUser.first}`)
      return { user: newUser, userJWT: jsn.data.userJWT }
    }

    throw error
  }
}
