// import type {
//   User as PrismaUser,
//   DriveFileData as PrismaDriveFileData,
//   Stats as PrismaStats,
//   Credential as PrismaCredential,
//   Student as PrismaStudent,
// } from "@prisma/client"
export type {
  User,
  Student,
  DriveFileData,
  PrismaUserWithAll,
  ProviderUser,
  Credential,
  Stats,
} from "./prisma-types"

// export type PrismaUserAll = PrismaUser & {
//   credential: PrismaCredential | null
//   stats: PrismaStats | null
//   student?: PrismaStudent | null
//   driveFileData?: PrismaDriveFileData[] | null
// }

export type { DriveFile, Tokens, Person } from "./google-types"

export type {
  User as PrismaUser,
  DriveFileData as PrismaDriveFileData,
  Stats as PrismaStats,
  Credential as PrismaCredential,
  Student as PrismaStudent,
} from "@prisma/client"

// rexp = refresh token expiry date
export type Payload = {
  email: string
  exp: number
  rexp: number
}

// export type DriveFileData = Omit<
//   PrismaDriveFileData,
//   "createdTime" | "modifiedTime" | "firstSeen" | "lastSeen" | "appProperties"
// > & {
//   createdTime: number
//   modifiedTime: number
//   firstSeen: number
//   lastSeen: number
//   appProperties: {
//     [key: string]: string | null
//   } | null
// }

// export interface User {
//   id: number
//   first: string
//   last: string
//   email: string
//   picture: string
//   role: Role
//   activated: boolean
//   createdAt: Date
//   updatedAt: Date
//   credential: Credential | null
//   stats: Stats | null
//   student?: Student | null
//   studentGakuseki?: number | null
//   driveFileData?: DriveFileData[] | null
// }

// type Credential = {
//   accessToken: string
//   expiry: number
//   refreshToken: string | null
//   refreshTokenExpiry: number
//   createdAt: Date
// }

// export type Student = {
//   gakuseki: number
//   gakunen: string
//   hr: string
//   hrNo: number
//   last: string
//   first: string
//   sei: string
//   mei: string
//   email: string
//   folderLink?: string | null
//   userId?: number
//   createdAt?: Date
//   expiry?: number
// }
