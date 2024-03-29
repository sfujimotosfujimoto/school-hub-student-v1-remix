import { type drive_v3, google } from "googleapis"
import { getClient } from "./google.server"
import { logger } from "~/lib/logger"
import type { DriveFile } from "~/types"
import { QUERY_FILES_FIELDS, QUERY_FILE_FIELDS } from "~/config"

export async function getDriveFiles(
  accessToken: string,
  query: string,
): Promise<DriveFile[]> {
  try {
    const drive = await getDrive(accessToken)
    if (!drive) throw new Error("Couldn't get drive")

    const files: drive_v3.Schema$File[] = await execFilesList(drive, query)

    if (!files) return []

    return mapFilesToDriveFiles(files)
  } catch (error) {
    console.error(`getDriveFiles: ${error}`)
    return []
  }
}

export async function getDriveFileByFileId(
  accessToken: string,
  fileId: string,
): Promise<DriveFile | null> {
  try {
    const drive = await getDrive(accessToken)
    if (!drive) throw new Error("Couldn't get drive")

    const js = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=${QUERY_FILE_FIELDS}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ).then((r) => r.json())

    return mapFileToDriveFile(js)
    // return mapFileToDriveFile(res.data.files.at(0))
  } catch (error) {
    console.error(`getDriveFiles: ${error}`)
    return null
  }
}

//-------------------------------------------
// PRIVATE FUNCTIONS
//-------------------------------------------
/*********************************************************
 * # getDrive()
 * - gets Drive instance
 */
async function getDrive(accessToken: string): Promise<drive_v3.Drive | null> {
  try {
    const client = await getClient(accessToken)

    if (client) {
      const drive = google.drive({
        version: "v3",
        auth: client,
      })
      return drive
    }
    return null
  } catch (error) {
    console.error(`getDrive: ${error}`)
    return null
  }
}

async function execFilesList(
  drive: drive_v3.Drive,
  query: string,
): Promise<drive_v3.Schema$File[]> {
  let count = 0
  let files: drive_v3.Schema$File[] = []
  let nextPageToken = undefined

  const MaxSize = 3000

  try {
    do {
      const list: any = await drive.files.list({
        pageSize: 300,
        pageToken: nextPageToken,
        q: query,
        fields: QUERY_FILES_FIELDS,
      })
      if (list.data.files) {
        files = files.concat(list.data.files)
      }
      nextPageToken = list.data.nextPageToken

      logger.debug(
        `✅ execFilesList: files: ${
          files.length
        } files: count: ${count++}, nextPageToken: ${!!nextPageToken}`,
      )
    } while (nextPageToken && files.length < MaxSize)

    return files
  } catch (error) {
    console.error(`execFilesList: ${error}`)
    return []
  }
}
/**
 * Convert File[] to DriveFileData[]
 */
export function mapFilesToDriveFiles(
  files: drive_v3.Schema$File[],
): DriveFile[] {
  const driveFiles: DriveFile[] = files.map((d) => {
    return mapFileToDriveFile(d)
  })

  return driveFiles
}

function mapFileToDriveFile(file: drive_v3.Schema$File): DriveFile {
  // const permissions = convertPermissions(file.permissions)

  return {
    id: file.id || "",
    name: file.name || "",
    mimeType: file.mimeType || "",
    link: file.webViewLink || "",
    iconLink: file.iconLink || "",
    hasThumbnail: file.hasThumbnail || false,
    thumbnailLink: file.thumbnailLink || undefined,
    createdTime: file.createdTime ? new Date(file.createdTime) : undefined,
    modifiedTime: file.modifiedTime ? new Date(file.modifiedTime) : undefined,
    webContentLink: file.webContentLink || undefined,
    webViewLink: file.webViewLink || undefined,
    parents: file.parents || undefined,
    appProperties: file.appProperties
      ? JSON.stringify(file.appProperties)
      : undefined,
    // permissions: permissions,
  }
}

// function convertPermissions(
//   permissions: drive_v3.Schema$Permission[] | undefined,
// ): Permission[] | undefined {
//   if (!permissions) return undefined

//   return permissions.map((p) => {
//     let type_: "user" | "group" | "unknown" = "unknown"
//     if (isType(p.type)) {
//       type_ = p.type
//     }
//     let role: "owner" | "writer" | "reader" | "unknown" = "unknown"
//     if (isRole(p.role)) {
//       role = p.role
//     }

//     return {
//       id: p.id || "",
//       displayName: p.displayName || "",
//       type: type_,
//       emailAddress: p.emailAddress || "",
//       role: role,
//     }
//   })
// }

// function isType(x: unknown): x is "user" | "group" {
//   return ["user", "group"].includes(x as string)
// }
// function isRole(x: unknown): x is "owner" | "writer" | "reader" {
//   return ["owner", "writer", "reader"].includes(x as string)
// }

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

	return user
}


export function getTokensFromString(tokensString: string) {
	if (!tokensString) return null
	return JSON.parse(tokensString) as Tokens
}


*/
