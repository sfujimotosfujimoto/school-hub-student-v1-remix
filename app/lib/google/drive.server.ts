import { type drive_v3, google } from "googleapis"
import type { DriveFileData } from "~/types"
import { getClient } from "./google.server"

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

export async function getDriveFiles(
  drive: drive_v3.Drive,
  query: string
): Promise<DriveFileData[] | null> {
  const list = await drive.files.list({
    pageSize: 20,
    q: query,
    fields:
      "nextPageToken, files(id,name,mimeType,webViewLink,thumbnailLink,hasThumbnail,iconLink,createdTime,modifiedTime,webContentLink,parents)",
  })

  if (!list.data.files) return null

  const driveFileData: DriveFileData[] = list.data.files.map((d) => {
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
      parents: d.parents || undefined,
    }
  })

  return driveFileData
}

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
