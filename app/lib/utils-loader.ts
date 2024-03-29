import {
  DriveFileSchema,
  DriveFilesSchema,
  StudentSchema,
} from "~/types/schemas"
import type { DriveFile, Student } from "~/types"

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

export function convertDriveFiles(
  serializedDriveFiles: { [key: string]: any }[],
): DriveFile[] {
  const obj = convertDateStringsToDateObjects(serializedDriveFiles, [
    "createdTime",
    "modifiedTime",
  ])

  const res = DriveFilesSchema.safeParse(obj)

  if (!res.success) {
    throw new Error(res.error.message)
  }

  return res.data
}

export function convertDriveFile(serializedDriveFile: {
  [key: string]: any
}): DriveFile {
  const obj = convertDateStringsToDateObjects(
    [serializedDriveFile],
    ["createdTime", "modifiedTime"],
  )
  const res = DriveFileSchema.safeParse(obj.at(0))
  if (!res.success) {
    throw new Error(res.error.message)
  }

  return res.data
}
