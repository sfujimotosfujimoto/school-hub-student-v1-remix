import type { DriveFileData as PrismaDriveFileData } from "@prisma/client"

import { prisma } from "./db.server"
import type { DriveFile, DriveFileData } from "~/types"

export async function getDriveFileDataByFileId(
  fileId: string,
): Promise<DriveFileData | null> {
  const driveFileData = await prisma.driveFileData.findUnique({
    where: {
      fileId,
    },
  })

  if (!driveFileData) {
    return null
  }

  return returnDriveFileDatum(driveFileData)
}

// export async function getFilteredDriveFileData({
//   nendoString,
//   // tagString,
//   // extensionString,
//   // segmentString,
//   fileId,
// }: {
//   nendoString: string
//   // tagString: string
//   // extensionString: string
//   // segmentString: string
//   fileId: string
// }) {
//   const driveFileData = await prisma.driveFileData.findMany({
//     where: {
//       AND: [
//         {
//           fileId,
//         },
//         {
//           appProperties: {
//             equals: { nendo: null },
//           },
//         },
//       ],
//     },
//   })

//   if (!driveFileData) {
//     return null
//   }

//   return returnDriveFileData(driveFileData)
// }
//

export async function getDriveFileDataByFolderId(
  folderId: string,
): Promise<DriveFileData[]> {
  const driveFileData = await prisma.driveFileData.findMany({
    where: {
      parents: {
        has: folderId,
      },
    },
  })

  if (!driveFileData) {
    return []
  }

  return returnDriveFileData(driveFileData)
}

export async function updateDriveFileData(
  fileId: string,
): Promise<DriveFileData> {
  // only update if lastSeen is more than 1 hour ago
  const dfd = await prisma.driveFileData.findUnique({
    where: {
      fileId,
      // lastSeen: {
      //   lt: new Date().getTime() - 1000 * 60,
      // },
    },
  })

  if (!dfd) {
    throw new Error("DriveFileData not found")
  }

  if (dfd.lastSeen < new Date(new Date().getTime() - 1000 * 60)) {
    // console.log("✅ lastSeen is more than 1 hour ago")
    const dfp = await prisma.driveFileData.update({
      where: {
        fileId,
      },
      data: {
        firstSeen: dfd.views > 0 ? dfd.firstSeen : new Date(),
        lastSeen: new Date(),
        views: {
          increment: 1,
        },
      },
    })
    return returnDriveFileDatum(dfp)
  } else {
    // console.log("✅ lastSeen is less than 1 hour ago")
    return returnDriveFileDatum(dfd)
  }
}

export async function updateThumbnails(driveFiles: DriveFile[]) {
  await prisma.$transaction([
    ...driveFiles.map((driveFile) =>
      prisma.driveFileData.update({
        where: {
          fileId: driveFile.id,
        },
        data: {
          thumbnailLink: driveFile.thumbnailLink,
        },
      }),
    ),
  ])
}

// async function updateThumbnail(fileId: string, thumbnailLink: string) {
//   const dfd = await prisma.driveFileData.update({
//     where: {
//       fileId,
//     },
//     data: {
//       thumbnailLink,
//     },
//   })

//   return dfd
// }

// export async function saveDriveFileDatum(
//   userId: number,
//   driveFile: DriveFile,
// ): Promise<PrismaDriveFileData> {
//   const df = await prisma.driveFileData.findUnique({
//     where: {
//       fileId: driveFile.id,
//     },
//   })

//   if (df && driveFile.thumbnailLink) {
//     const dfd = await updateThumbnail(driveFile.id, driveFile.thumbnailLink)
//     return dfd
//   } else if (df) {
//     return df
//   }

//   const dfd = await prisma.driveFileData.create({
//     data: {
//       fileId: driveFile.id,
//       name: driveFile.name,
//       mimeType: driveFile.mimeType,
//       iconLink: driveFile.iconLink,
//       hasThumbnail: driveFile.hasThumbnail,
//       thumbnailLink: driveFile.thumbnailLink,
//       webViewLink: driveFile.link,
//       webContentLink: driveFile.webContentLink,
//       createdTime: driveFile.createdTime || new Date(),
//       modifiedTime: driveFile.modifiedTime || new Date(),
//       parents: driveFile.parents,
//       appProperties: driveFile.appProperties,
//       firstSeen: new Date().getTime(),
//       lastSeen: new Date().getTime(),
//       userId,
//     },
//   })
//   console.log("✅ in saveDriveFileDatum: dfd", dfd)
//   return dfd
// }

export async function saveDriveFileData(
  userId: number,
  driveFiles: DriveFile[],
) {
  // console.log("✅ in saveDriveFileData: driveFiles", driveFiles.length)

  const data = driveFiles.map((driveFile) => ({
    fileId: driveFile.id,
    name: driveFile.name,
    mimeType: driveFile.mimeType,
    iconLink: driveFile.iconLink,
    hasThumbnail: driveFile.hasThumbnail,
    thumbnailLink: driveFile.thumbnailLink,
    webViewLink: driveFile.link,
    webContentLink: driveFile.webContentLink,
    createdTime: driveFile.createdTime || new Date(),
    modifiedTime: driveFile.modifiedTime || new Date(),
    parents: driveFile.parents,
    appProperties: driveFile.appProperties
      ? JSON.stringify(driveFile.appProperties)
      : undefined,
    firstSeen: new Date(),
    lastSeen: new Date(),
    userId,
  }))

  const countMany = await prisma.driveFileData.createMany({
    data,
    skipDuplicates: true,
  })
  return countMany

  // const driveFileDataP: Promise<PrismaDriveFileData>[] = []
  // for (const driveFile of driveFiles) {
  //   const df = saveDriveFileDatum(userId, driveFile)
  //   if (!df) {
  //     continue
  //   }
  //   driveFileDataP.push(df)
  // }

  // const dfd = await Promise.all(driveFileDataP)
  // return returnDriveFileData(dfd)
}

export function returnDriveFileDatum(
  prismaDriveFileData: PrismaDriveFileData,
): DriveFileData {
  return {
    ...prismaDriveFileData,
    createdTime: prismaDriveFileData.createdTime,
    modifiedTime: prismaDriveFileData.modifiedTime,
  }
}

export function returnDriveFileData(
  prismaDriveFileData: PrismaDriveFileData[],
): DriveFileData[] {
  return prismaDriveFileData.map(returnDriveFileDatum)
}
/*
type PrismaDriveFileData = {
    createdTime: Date;
    modifiedTime: Date;
    parents: string[];
    appProperties: Prisma.JsonValue | null;
    views: number;
    firstSeen: bigint;
    lastSeen: bigint;
    userId: number;
}
type DriveFileData = {
    fileId: string;
    name: string;
    mimeType: string;
    iconLink: string;
    hasThumbnail: boolean;
    parents: string[];
    createdTime: string;
    modifiedTime: string;
    views: number;
    firstSeen: number;
    lastSeen: number;
    ... 4 more ...;
    appProperties?: Record<...> | undefined;
}
*/
