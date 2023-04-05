import { json, type LoaderArgs } from "@remix-run/node"
import { getDrive } from "~/lib/google.server"
import { getUserWithCredential } from "~/lib/user.server"
import type { drive_v3 } from "googleapis"
import { Permission } from "~/types"

// akiba
// https://drive.google.com/drive/folders/1REcOw43A014Tx43d5m546_g7Is-2pOlY?usp=share_link

export async function loader({ request }: LoaderArgs) {
  console.log(
    '🚀 routes/google.drive.tsx ~ 	🌈 request.headers.get("Cookie") ✨ ',
    request.headers.get("Cookie")
  )

  let user
  try {
    user = await getUserWithCredential(request)

    console.log("🚀 routes/google.drive.tsx ~ 	🌈 user ✨ ", user)

    // get drive instance
    const drive = await getDrive(user.Credential.accessToken)

    if (!drive) {
      throw json(
        { errorMessage: "Unauthorized Google Account" },
        {
          status: 500,
        }
      )
    }
    // TODO: temporary for testing
    const fileId = "1REcOw43A014Tx43d5m546_g7Is-2pOlY"

    // call drive
    const permissions = await callPermissions(drive, fileId)

    return {
      permissions,
    }
  } catch (error) {
    throw json(
      { errorMessage: "Permissions not found" },
      {
        status: 400,
      }
    )
  }
}

export async function callPermissions(
  drive: drive_v3.Drive,
  fileId: string
): Promise<Permission[]> {
  const fields = "permissions(id,type,emailAddress,role,displayName)"
  const list = await drive.permissions.list({
    fileId,
    fields,
  })

  const permissions = list.data as Permission[]

  return permissions
}

/*
  {
    id: '17588673098338699335',
    displayName: '藤本俊',
    type: 'user',
    emailAddress: 's-fujimoto@seig-boys.jp',
    role: 'owner'
  }

*/
