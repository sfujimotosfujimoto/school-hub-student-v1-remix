import {
  DriveFileDataSchema,
  DriveFileDatasSchema,
  StudentSchema,
} from "~/types/schemas"
import type { DriveFileData, Student } from "~/types"

// Function to convert date strings to Date objects for specified keys
export function convertDateStringsToDateObjects(
  array: { [key: string]: any }[],
  keys: string[],
) {
  return array.map((object) => {
    const modifiedObject: { [key: string]: any } = { ...object }

    keys.forEach((key: string) => {
      if (object[key]) {
        modifiedObject[key] = new Date(object[key])
      }
    })

    return modifiedObject
  })
}

export function convertDriveFileData(
  serializedDriveFileData: { [key: string]: any }[],
): DriveFileData[] {
  const obj = convertDateStringsToDateObjects(serializedDriveFileData, [
    "createdTime",
    "modifiedTime",
    "firstSeen",
    "lastSeen",
  ])

  const res = DriveFileDatasSchema.safeParse(obj)
  if (!res.success) {
    throw new Error(res.error.message)
  }

  return res.data
}

export function convertDriveFileDatum(serializedDriveFileDatum: {
  [key: string]: any
}): DriveFileData {
  const obj = convertDateStringsToDateObjects(
    [serializedDriveFileDatum],
    ["createdTime", "modifiedTime", "firstSeen", "lastSeen"],
  )
  const res = DriveFileDataSchema.safeParse(obj.at(0))
  if (!res.success) {
    throw new Error(res.error.message)
  }

  return res.data
}

export function convertStudent(serializedStudent: {
  [key: string]: any
}): Student {
  const obj = convertDateStringsToDateObjects(
    [serializedStudent],
    ["createdAt", "expiry"],
  )
  const res = StudentSchema.safeParse(obj.at(0))
  if (!res.success) {
    throw new Error(res.error.message)
  }

  return res.data
}
