import { redirect } from "@remix-run/node"

export function redirectToSignin(
  urlParam = "authstate=unauthorized",
  headers?: Headers,
): void {
  if (headers) {
    throw redirect(`/auth/signin?${urlParam}`, { headers })
  }
  throw redirect(`/auth/signin?${urlParam}`)
}
