import type { DriveFileData as PrismaDriveFileData } from "@prisma/client"

import type { DriveFile, DriveFileData } from "~/types"
import { prisma } from "../db.server"

export async function getDriveFileDataByFileId(
  fileId: string,
): Promise<DriveFileData | null> {
  const driveFileData = await prisma.driveFileData.findUnique({
    where: {
      fileId,
    },
    // select: {
    //   ...selectDriveFileData,
    // },
  })

  if (!driveFileData) {
    return null
  }

  return returnDriveFileDatum(driveFileData)
}

export async function updateDriveFileData(fileId: string) {
  // only update if lastSeen is more than 1 hour ago
  const dfd = await prisma.driveFileData.findUnique({
    where: {
      fileId,
      lastSeen: {
        lt: new Date().getTime() - 1000 * 60,
      },
    },
  })

  if (!dfd) {
    return
  }

  return await prisma.driveFileData.update({
    where: {
      fileId,
    },
    data: {
      firstSeen: dfd.views > 0 ? dfd.firstSeen : new Date().getTime(),
      lastSeen: new Date().getTime(),
      views: {
        increment: 1,
      },
    },
  })
}

export async function saveDriveFileDatum(
  userId: number,
  driveFile: DriveFile,
): Promise<PrismaDriveFileData | null> {
  const df = await prisma.driveFileData.findUnique({
    where: {
      fileId: driveFile.id,
    },
  })

  if (df) {
    return null
  }

  return await prisma.driveFileData.create({
    data: {
      fileId: driveFile.id,
      name: driveFile.name,
      mimeType: driveFile.mimeType,
      iconLink: driveFile.iconLink,
      hasThumbnail: driveFile.hasThumbnail,
      thumbnailLink: driveFile.thumbnailLink,
      webContentLink: driveFile.webContentLink,
      createdTime: driveFile.createdTime || new Date(),
      modifiedTime: driveFile.modifiedTime || new Date(),
      parents: driveFile.parents,
      appProperties: driveFile.appProperties,
      firstSeen: new Date().getTime(),
      lastSeen: new Date().getTime(),
      userId,
    },
  })
}

export function saveDriveFileData(
  userId: number,
  driveFiles: DriveFile[],
): Promise<PrismaDriveFileData | null>[] {
  const driveFileDataPromises: Promise<PrismaDriveFileData | null>[] =
    driveFiles.map((driveFile) => saveDriveFileDatum(userId, driveFile))

  return driveFileDataPromises
}

export function returnDriveFileDatum(
  prismaDriveFileData: PrismaDriveFileData,
): DriveFileData {
  const { firstSeen, lastSeen } = prismaDriveFileData

  const firstSeen2 = Number(firstSeen)
  const lastSeen2 = Number(lastSeen)

  return {
    ...prismaDriveFileData,
    firstSeen: firstSeen2,
    lastSeen: lastSeen2,
  }
}

export function returnDriveFileData(
  prismaDriveFileData: PrismaDriveFileData[],
): DriveFileData[] {
  return prismaDriveFileData.map(returnDriveFileDatum)
}
