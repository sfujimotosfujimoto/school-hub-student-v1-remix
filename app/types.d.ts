import type {
  Role,
  User as PrismaUser,
  DriveFileData as PrismaDriveFileData,
} from "@prisma/client"

export type DriveFileData = Omit<
  PrismaDriveFileData,
  "firstSeen" | "lastSeen"
> & {
  firstSeen: number
  lastSeen: number
}

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
  credential: Credential | null
  stats: Stats | null
  student?: Student | null
  studentGakuseki?: number | null
  driveFileData?: PrismaDriveFileData[] | null
}

export type ProviderUser = Pick<User, "id" | "role" | "email" | "picture">

type Credential = {
  accessToken: string
  expiry: number
  refreshToken: string | null
  refreshTokenExpiry: number
  createdAt: Date
}
type PrismaCredential = {
  accessToken: string
  expiry: bigint
  refreshToken: string | null
  refreshTokenExpiry: bigint
  createdAt: Date
}

type Stats = {
  count: number
  lastVisited: Date
}

export type PrismaUserWithAll = PrismaUser & {
  credential: PrismaCredential | null
  stats: Stats | null
  student?: PrismaStudent | null
  driveFileData?: PrismaDriveFileData[] | null
}

export type DriveFile = {
  id: string
  name: string
  mimeType: string
  link?: string
  iconLink: string
  hasThumbnail: boolean
  thumbnailLink?: string
  createdTime?: string
  modifiedTime?: string
  webContentLink?: string
  parents?: string[]
  appProperties?: {
    [key: string]: string | null
  }
  // meta?: DriveFileMeta
}

export type DriveFileMeta = {
  selected?: boolean
  studentFolder?: {
    folderLink?: string
    folderId?: string
    name?: string
  }
  destination?: {
    folderId?: string
    name?: string
  }
  last?: {
    folderId?: string
  }
  file?: {
    segments?: string[]
    name?: string
    formerName?: string
    studentEmail?: string
    tags?: string
    nendo?: string
  }
  student?: Student
  permissions?: Permission[]
}

export type Student = {
  gakuseki: number
  gakunen: string
  hr: string
  hrNo: number
  last: string
  first: string
  sei: string
  mei: string
  email: string
  folderLink?: string | null
  userId?: number
  createdAt?: Date
  expiry?: number
}
export type PrismaStudent = {
  gakuseki: number
  gakunen: string
  hr: string
  hrNo: number
  last: string
  first: string
  sei: string
  mei: string
  email: string
  folderLink?: string | null
  userId?: number
  createdAt?: Date
  expiry?: bigint
}

export type Permission = {
  id: string
  displayName: string
  type: "user" | "group"
  emailAddress: string
  role: "owner" | "writer" | "reader"
}

// rexp = refresh token expiry date
export type Payload = {
  email: string
  exp: number
  rexp: number
}
