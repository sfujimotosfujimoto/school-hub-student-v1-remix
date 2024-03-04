export const REFRESH_EXPIRY = 1000 * 60 * 60 * 24 * 14 // 14 days
export const CACHE_MAX_AGE_SECONDS = 60 * 10 // 10 minutes
export const DEV_EXPIRY = 1000 * 15 // 15 seconds
export const DEV_REFERSH_EXPIRY = 1000 * 60 * 60 // 1 hour
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14 // 14 days

export const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]

export const QUERY_FILES_FIELDS =
  "nextPageToken, files(id,name,mimeType,webViewLink,thumbnailLink,hasThumbnail,iconLink,createdTime,modifiedTime,webContentLink,parents,appProperties)"
export const QUERY_FILE_FIELDS =
  "id,name,mimeType,webViewLink,thumbnailLink,hasThumbnail,iconLink,createdTime,modifiedTime,webContentLink,parents,appProperties"
export const QUERY_PERMISSION_FIELDS =
  "permissions(id,type,emailAddress,role,displayName)"
