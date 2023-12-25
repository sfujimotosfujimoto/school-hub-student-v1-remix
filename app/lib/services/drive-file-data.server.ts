import type { DriveFileData as PrismaDriveFileData } from "@prisma/client"

import type { DriveFileData } from "~/types"
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
