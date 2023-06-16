import type { Role } from "@prisma/client"

export type Tokens = {
  access_token: string
  scope: string
  token_type: string
  expiry_date: number
  id_token?: string
  refresh_token?: string
}

export interface Person {
  last: string
  first: string
  email: string
  picture: string
}

export interface UserBase extends Person {
  exp: number
}

export type Gakunen = "ALL" | "J1" | "J2" | "J3" | "H1" | "H2" | "H3"
export type Hr = "ALL" | "A" | "B" | "C" | "D" | "E"

export interface User {
  id: number
  first: string
  last: string
  email: string
  picture: string
  role: Role
  activated: boolean
  createdAt: Date
  updatedAt: Date
  credential: {
    accessToken: string
    expiryDate: number
  } | null
  stats: {
    count: number
    lastVisited: Date
  } | null
}

export interface RawUser {
  id: number
  first: string
  last: string
  email: string
  picture: string
  role: Role
  activated: boolean
  createdAt: string
  updatedAt: string
  credential: {
    accessToken: string
    expiryDate: number
  } | null
  stats: {
    count: number
    lastVisited: string
  } | null
}

export interface PrismaUser {
  id: number
  first: string
  last: string
  email: string
  picture: string
  role: Role
  activated: boolean
  createdAt: Date
  updatedAt: Date
  credential: {
    accessToken: string
    expiryDate: bigint
  } | null
  stats: {
    count: number
    lastVisited: Date
  } | null
}

export type DriveFileData = {
  id: string
  name: string
  mimeType: string
  link: string
  iconLink: string
  hasThumbnail: boolean
  thumbnailLink?: string
  createdTime?: string
  modifiedTime?: string
  webContentLink?: string
  parents?: string[]
}

export type StudentData = {
  gakuseki: number
  gakunen: string
  hr: string
  hrNo: number
  last: string
  first: string
  sei: string
  mei: string
  email: string
  folderLink: string | null
}
