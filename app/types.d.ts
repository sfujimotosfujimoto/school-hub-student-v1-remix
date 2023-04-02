export type Tokens = {
  access_token: string
  scope: string
  token_type: string
  expiry_date: number
  id_token?: string
  refresh_token?: string
}

// //changed
// export type IdToken = {
//   iss: string // 'https://accounts.google.com',
//   azp: string // '480307068015-64puammnr33ri1bub6i3b5ggniu5hnhm.apps.googleusercontent.com',
//   aud: string // '480307068015-64puammnr33ri1bub6i3b5ggniu5hnhm.apps.googleusercontent.com',
//   sub: string // '106691296406499736818',
//   hd: string // 'seig-boys.jp',
//   email: string // 's-fujimoto@seig-boys.jp',
//   email_verified: boolean // true,
//   at_hash: string // 'pCMvRYUXsF_EvLFQGcLfJg',
//   name: string // '藤本俊',
//   picture: string // 'https://lh3.googleusercontent.com/a/AGNmyxYQDoEK118Sij2FSXLNVPU4Y02obb_TSOCE3hYmeA=s96-c',
//   given_name: string // '俊',
//   family_name: string // '藤本',
//   locale: string // 'ja',
//   iat: number // 1679638156,
//   exp: number // 1679641756
// }

export type LoadingStatus = "idle" | "loading" | "success" | "error"

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
