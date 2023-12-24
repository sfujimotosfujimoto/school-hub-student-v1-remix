// import { sessionStorage } from "~/lib/services/session.server"

// export async function getUserId(request: Request) {
//   const authSession = await sessionStorage.getSession(
//     request.headers.get("cookie"),
//   )
//   const sessionId = authSession.get(sessionKey)
//   if (!sessionId) return null
//   const session = await prisma.session.findUnique({
//     select: { user: { select: { id: true } } },
//     where: { id: sessionId, expirationDate: { gt: new Date() } },
//   })
//   if (!session?.user) {
//     throw redirect("/", {
//       headers: {
//         "set-cookie": await sessionStorage.destroySession(authSession),
//       },
//     })
//   }
//   return session.user.id
// }
