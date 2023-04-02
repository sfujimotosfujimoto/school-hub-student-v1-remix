export type Tokens = {
  access_token: string
  scope: string
  token_type: string
  expiry_date: number
  id_token?: string
  refresh_token?: string
}

export type UserBase = {
  last: string
  first: string
  email: string
  picture: string
  exp: number
}

export type Gakunen = "ALL" | "J1" | "J2" | "J3" | "H1" | "H2" | "H3"
export type Hr = "ALL" | "A" | "B" | "C" | "D" | "E"

export interface UserWithCredential {
  id: number
  first: string
  last: string
  email: string
  Credential: {
    accessToken: string
    // idToken: string
    expiryDate: bigint
  }
}

export type RowType = {
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


export type Permission =   {
  id: string
  displayName: string
  type: 'user' | 'group',
  emailAddress: string
  role: 'owner' | 'writer' | 'reader'
}