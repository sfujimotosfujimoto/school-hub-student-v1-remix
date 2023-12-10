import { google } from "googleapis"
import type { Person } from "~/types"
import { getClient } from "./google.server"

async function getPeople(accessToken: string) {
  const client = await getClient(accessToken)

  if (!client) return null

  const people = google.people({
    version: "v1",
    auth: client,
  })

  if (!people) return null
  else return people
}

export async function getPersonFromPeople(
  accessToken: string,
): Promise<Person | null> {
  const people = await getPeople(accessToken)

  if (!people) return null

  const resp = await people.people.get({
    resourceName: "people/me",
    personFields: "emailAddresses,names,photos,coverPhotos,metadata",
  })

  const first = resp.data.names?.at(0)?.givenName
  const last = resp.data.names?.at(0)?.familyName
  const picture = resp.data.photos?.at(0)?.url || ""

  const email = resp.data.emailAddresses?.at(0)?.value

  if (!email || !first || !last) return null

  return { email, first, last, picture }
}
