// Type '
type A = {
  fileId: string
  name: string
  mimeType: string
  iconLink: string
  hasThumbnail: boolean
  thumbnailLink: string | null
  webViewLink: string | null
  webContentLink: string | null
  createdTime: Date
  modifiedTime: Date
  parents: string[]
  appProperties: JsonValue
  views: number
  firstSeen: bigint
  lastSeen: bigint
  userId: number
}[]
// ' is missing the following properties from type '
type A2 = {
  userId: number // !!
  fileId: string
  name: string
  mimeType: string
  iconLink: string
  hasThumbnail: boolean
  thumbnailLink: string | null
  webViewLink: string | null
  webContentLink: string | null
  parents: string[]
  appProperties: Record<string, string> | null
  createdTime: Date
  modifiedTime: Date
  views: number
  firstSeen: number
  lastSeen: number
}
