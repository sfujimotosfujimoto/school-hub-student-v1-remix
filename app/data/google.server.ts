import { json } from "@remix-run/node"
import { type drive_v3, google, type sheets_v4 } from "googleapis"
import invariant from "tiny-invariant"
import type { RowType, StudentData } from "~/types"

// import { getFolderId } from "./google.client"

/*********************************************************
 * Create OAuth client from given tokens in cookie
 */
export async function getClient(accessToken: string) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_API_CLIENT_ID,
    process.env.GOOGLE_API_CLIENT_SECRET,
    process.env.GOOGLE_API_REDIRECT_URI
  )
  client.setCredentials({ access_token: accessToken })

  return client
}

/*********************************************************
 * # getDrive()
 * - gets Drive instance
 */
export async function getDrive(
  accessToken: string
): Promise<drive_v3.Drive | null> {
  const client = await getClient(accessToken)

  if (client) {
    const drive = google.drive({
      version: "v3",
      auth: client,
    })
    return drive
  }
  return null
}
/*********************************************************
 * # getDrive()
 * - gets Drive instance
 */
export async function getSheets(
  accessToken: string
): Promise<sheets_v4.Sheets | null> {
  const client = await getClient(accessToken)

  if (client) {
    const sheets = google.sheets({
      version: "v4",
      auth: client,
    })
    return sheets
  }
  return null
}

export function getFolderId(folderUrl: string): string | null {
  if (!folderUrl) return null
  const output = String(folderUrl).split("/").at(-1)
  if (!output) return null
  return output
}

export function createQuery({
  folderId,
  mimeType,
}: {
  folderId: string
  mimeType: string
}) {
  const outputQuery = []

  outputQuery.push("trashed=false")
  let parentsQuery: string
  if (folderId) {
    parentsQuery = `'${folderId.trim()}' in parents`
    outputQuery.push(parentsQuery)
  }

  let mimeTypeQuery: string
  if (mimeType) {
    mimeTypeQuery = `mimeType='${mimeType.trim()}'`
    outputQuery.push(mimeTypeQuery)
  }

  if (!outputQuery) return null

  return outputQuery.join(" and ")
}

type UserWithCredentials = {
  Credential: {
    accessToken: string
    idToken: string
    expiryDate: bigint
  } | null
  email: string
  id: number
  first: string
  last: string
}

export async function getStudentDataResponse(user: UserWithCredentials) {
  try {
    const studentData = await getStudentData(user)
    return json({ studentData })
  } catch (error) {
    return json(
      { errorMessage: "Unauthorized google account" },
      {
        status: 500,
      }
    )
  }
}

export async function getStudentData(user: UserWithCredentials) {
  invariant(user.Credential, "Unauthorized google account")

  const sheets = await getSheets(user.Credential.accessToken)
  invariant(sheets, "Unauthorized google account")

  const meiboSheetId = process.env.GOOGLE_API_MEIBO_SHEET_URI
  invariant(meiboSheetId, "No meibo sheet id")

  try {
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: meiboSheetId,
      range: "MEIBO!A2:J916",
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    const data = resp.data.values
    invariant(data, "Could not get data")

    const studentData: StudentData[] = data.map((d) => {
      return {
        gakuseki: (d[0] || 0) as number,
        gakunen: d[1] as string,
        hr: d[2] as string,
        hrNo: Number(d[3]) as number,
        last: d[4] as string,
        first: d[5] as string,
        sei: d[6] as string,
        mei: d[7] as string,
        email: d[8] as string,
        folderLink: (d[9] || null) as string | null,
      }
    })
    return studentData
  } catch (err) {
    throw Error(`Something went wrong getting data from spreadsheet. ${err}`)
  }
}

export async function callDriveAPI(
  drive: drive_v3.Drive,
  query: string
): Promise<RowType[] | null> {
  const list = await drive.files.list({
    pageSize: 20,
    q: query,
    fields:
      "nextPageToken, files(id,name,mimeType,webViewLink,thumbnailLink,hasThumbnail,iconLink,createdTime,modifiedTime,webContentLink)",
  })

  if (!list.data.files) return null

  const rows: RowType[] = list.data.files.map((d) => {
    return {
      id: d.id || "",
      name: d.name || "",
      mimeType: d.mimeType || "",
      link: d.webViewLink || "",
      iconLink: d.iconLink || "",
      hasThumbnail: d.hasThumbnail || false,
      thumbnailLink: d.thumbnailLink || undefined,
      createdTime: d.createdTime || undefined,
      modifiedTime: d.modifiedTime || undefined,
      webContentLink: d.webContentLink || undefined,
    }
  })

  return rows
}

export function getStudentByFolderId(
  folderId: string,
  studentData: StudentData[]
): StudentData | null {
  const studentD = studentData.find(
    (d) => d.folderLink && folderId === getFolderId(d.folderLink)
  )

  if (studentD) return studentD

  return null
}

/*


export async function getStudentData(user: UserWithCredentials) {
  if (!user.Credential) {
    return json(
      { errorMessage: "Unauthorized google account" },
      {
        status: 500,
      }
    )
  }

  const sheets = await getSheets(user.Credential.accessToken)

  if (!sheets) {
    return json(
      { errorMessage: "Unauthorized google account" },
      {
        status: 500,
      }
    )
  }

  const meiboSheetId = process.env.GOOGLE_API_MEIBO_SHEET_URI

  if (!meiboSheetId) {
    return json(
      { errorMessage: "No meibo sheet id" },
      {
        status: 500,
      }
    )
  }

  try {
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: meiboSheetId,
      range: "MEIBO!A2:J916",
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    const data = resp.data.values

    if (!data) {
      return json(
        { errorMessage: "Could not get data" },
        {
          status: 500,
        }
      )
    }

    const studentData: StudentData[] = data.map((d) => {
      return {
        gakuseki: (d[0] || 0) as number,
        gakunen: d[1] as string,
        hr: d[2] as string,
        hrNo: Number(d[3]) as number,
        last: d[4] as string,
        first: d[5] as string,
        sei: d[6] as string,
        mei: d[7] as string,
        email: d[8] as string,
        folderLink: (d[9] || null) as string | null,
      }
    })
    return json({ studentData })
  } catch (err) {
    return json(
      {
        errorMessage:
          "Something went wrong getting data from spreadsheet. " + err,
      },
      {
        status: 500,
      }
    )
  }
}

*/

/*


{
  "kind": "drive#file",
  "id": string,
  "name": string,
  "mimeType": string,
  "description": string,
  "starred": boolean,
  "trashed": boolean,
  "explicitlyTrashed": boolean,
  "trashingUser": {
    "kind": "drive#user",
    "displayName": string,
    "photoLink": string,
    "me": boolean,
    "permissionId": string,
    "emailAddress": string
  },
  "trashedTime": datetime,
  "parents": [
    string
  ],
  "properties": {
    (key): string
  },
  "appProperties": {
    (key): string
  },
  "spaces": [
    string
  ],
  "version": long,
  "webContentLink": string,
  "webViewLink": string,
  "iconLink": string,
  "hasThumbnail": boolean,
  "thumbnailLink": string,
  "thumbnailVersion": long,
  "viewedByMe": boolean,
  "viewedByMeTime": datetime,
  "createdTime": datetime,
  "modifiedTime": datetime,
  "modifiedByMeTime": datetime,
  "modifiedByMe": boolean,
  "sharedWithMeTime": datetime,
  "sharingUser": {
    "kind": "drive#user",
    "displayName": string,
    "photoLink": string,
    "me": boolean,
    "permissionId": string,
    "emailAddress": string
  },
  "owners": [
    {
      "kind": "drive#user",
      "displayName": string,
      "photoLink": string,
      "me": boolean,
      "permissionId": string,
      "emailAddress": string
    }
  ],
  "teamDriveId": string,
  "driveId": string,
  "lastModifyingUser": {
    "kind": "drive#user",
    "displayName": string,
    "photoLink": string,
    "me": boolean,
    "permissionId": string,
    "emailAddress": string
  },
  "shared": boolean,
  "ownedByMe": boolean,
  "capabilities": {
    "canAcceptOwnership": boolean,
    "canAddChildren": boolean,
    "canAddFolderFromAnotherDrive": boolean,
    "canAddMyDriveParent": boolean,
    "canChangeCopyRequiresWriterPermission": boolean,
    "canChangeSecurityUpdateEnabled": boolean,
    "canChangeViewersCanCopyContent": boolean,
    "canComment": boolean,
    "canCopy": boolean,
    "canDelete": boolean,
    "canDeleteChildren": boolean,
    "canDownload": boolean,
    "canEdit": boolean,
    "canListChildren": boolean,
    "canModifyContent": boolean,
    "canModifyContentRestriction": boolean,
    "canModifyLabels": boolean,
    "canMoveChildrenOutOfTeamDrive": boolean,
    "canMoveChildrenOutOfDrive": boolean,
    "canMoveChildrenWithinTeamDrive": boolean,
    "canMoveChildrenWithinDrive": boolean,
    "canMoveItemIntoTeamDrive": boolean,
    "canMoveItemOutOfTeamDrive": boolean,
    "canMoveItemOutOfDrive": boolean,
    "canMoveItemWithinTeamDrive": boolean,
    "canMoveItemWithinDrive": boolean,
    "canMoveTeamDriveItem": boolean,
    "canReadLabels": boolean,
    "canReadRevisions": boolean,
    "canReadTeamDrive": boolean,
    "canReadDrive": boolean,
    "canRemoveChildren": boolean,
    "canRemoveMyDriveParent": boolean,
    "canRename": boolean,
    "canShare": boolean,
    "canTrash": boolean,
    "canTrashChildren": boolean,
    "canUntrash": boolean
  },
  "viewersCanCopyContent": boolean,
  "copyRequiresWriterPermission": boolean,
  "writersCanShare": boolean,
  "permissions": [
    permissions Resource
  ],
  "permissionIds": [
    string
  ],
  "hasAugmentedPermissions": boolean,
  "folderColorRgb": string,
  "originalFilename": string,
  "fullFileExtension": string,
  "fileExtension": string,
  "md5Checksum": string,
  "sha1Checksum": string,
  "sha256Checksum": string,
  "size": long,
  "quotaBytesUsed": long,
  "headRevisionId": string,
  "contentHints": {
    "thumbnail": {
      "image": bytes,
      "mimeType": string
    },
    "indexableText": string
  },
  "imageMediaMetadata": {
    "width": integer,
    "height": integer,
    "rotation": integer,
    "location": {
      "latitude": double,
      "longitude": double,
      "altitude": double
    },
    "time": string,
    "cameraMake": string,
    "cameraModel": string,
    "exposureTime": float,
    "aperture": float,
    "flashUsed": boolean,
    "focalLength": float,
    "isoSpeed": integer,
    "meteringMode": string,
    "sensor": string,
    "exposureMode": string,
    "colorSpace": string,
    "whiteBalance": string,
    "exposureBias": float,
    "maxApertureValue": float,
    "subjectDistance": integer,
    "lens": string
  },
  "videoMediaMetadata": {
    "width": integer,
    "height": integer,
    "durationMillis": long
  },
  "isAppAuthorized": boolean,
  "exportLinks": {
    (key): string
  },
  "shortcutDetails": {
    "targetId": string,
    "targetMimeType": string,
    "targetResourceKey": string
  },
  "contentRestrictions": [
    {
      "readOnly": boolean,
      "reason": string,
      "restrictingUser": {
        "kind": "drive#user",
        "displayName": string,
        "photoLink": string,
        "me": boolean,
        "permissionId": string,
        "emailAddress": string
      },
      "restrictionTime": datetime,
      "type": string
    }
  ],
  "labelInfo": {
    "labels": [
      {
        "kind": "drive#label",
        "id": string,
        "revisionId": string,
        "fields": {
          (key): {
            "kind": "drive#labelField",
            "id": string,
            "valueType": string,
            "dateString": [
              date
            ],
            "integer": [
              long
            ],
            "selection": [
              string
            ],
            "text": [
              string
            ],
            "user": [
              {
                "kind": "drive#user",
                "displayName": string,
                "photoLink": string,
                "me": boolean,
                "permissionId": string,
                "emailAddress": string
              }
            ]
          }
        }
      }
    ]
  },
  "resourceKey": string,
  "linkShareMetadata": {
    "securityUpdateEligible": boolean,
    "securityUpdateEnabled": boolean
  }
}



export async function getMe(
	tokens: Tokens
): Promise<drive_v3.Schema$User | null> {
	const drive = await getDrive(tokens)

	if (!drive) return null

	const res = await drive.about.get({
		fields: "user(displayName,photoLink,emailAddress)"
	})

	const user = res.data.user ? res.data.user : null
	console.log("🚀 google/client.ts ~ user", user?.displayName)
	return user
}


export function getTokensFromString(tokensString: string) {
	if (!tokensString) return null
	return JSON.parse(tokensString) as Tokens
}


*/
