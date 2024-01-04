type JsonifyObject = any
// Type '
type A = {
  userId: number
  fileId: string
  name: string
  mimeType: string
  iconLink: string
  hasThumbnail: boolean
  thumbnailLink: string | null
  webViewLink: string | null
  webContentLink: string | null
  parents: string[]
  appProperties: string | null
  createdTime: Date
  modifiedTime: Date
  views: number
  firstSeen: Date
  lastSeen: Date
}
type B = JsonifyObject<{
  userId: number
  fileId: string
  name: string
  mimeType: string
  iconLink: string
  hasThumbnail: boolean
  thumbnailLink: string | null
  webViewLink: string | null
  webContentLink: string | null
  parents: string[]
  appProperties: string | null
  createdTime: Date
  modifiedTime: Date
  views: number
  firstSeen: Date
  lastSeen: Date
}>
// '.
// Type '
type A2 = {
  userId: number
  fileId: string
  name: string
  mimeType: string
  iconLink: string
  hasThumbnail: boolean
  thumbnailLink: string | null
  webViewLink: string | null
  webContentLink: string | null
  parents: string[]
  appProperties: string | null
  createdTime: Date
  modifiedTime: Date
  views: number
  firstSeen: Date
  lastSeen: Date
}
// ' is not assignable to type '

type C = {
  userId: number
  fileId: string
  name: string
  mimeType: string
  iconLink: string
  hasThumbnail: boolean
  thumbnailLink: string | null
  webViewLink: string | null
  webContentLink: string | null
  parents: string[]
  appProperties: string | null
  createdTime: string
  modifiedTime: string
  views: number
  firstSeen: string
  lastSeen: string
}
// '.
// Types of property 'createdTime' are incompatible.
// Type 'Date' is not assignable to type 'string'.
