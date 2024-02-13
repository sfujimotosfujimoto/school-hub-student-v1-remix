import { z } from "zod"

export const StudentSchema = z.object({
  gakuseki: z.number(),
  gakunen: z.string(),
  hr: z.string(),
  hrNo: z.number(),
  last: z.string(),
  first: z.string(),
  sei: z.string(),
  mei: z.string(),
  email: z.string(),
  folderLink: z.string().nullable(),
  createdAt: z.date(),
  // createdAt: z
  //   .string()
  //   .or(z.date())
  //   .transform((arg) => new Date(arg))
  //   .nullable(),
  expiry: z.date(),
  // expiry: z.string().datetime(),
  users: z.array(z.number()).nullable(),
})

export const DriveFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  link: z.string().optional(),
  iconLink: z.string(),
  hasThumbnail: z.boolean(),
  thumbnailLink: z.string().optional(),
  createdTime: z.date(),
  // createdTime: z.string().datetime(),
  // createdTime: z
  //   .string()
  //   .or(z.date())
  //   .transform((arg) => new Date(arg))
  //   .optional(),
  modifiedTime: z.date(),
  // modifiedTime: z.string().datetime(),
  // modifiedTime: z
  //   .string()
  //   .or(z.date())
  //   .transform((arg) => new Date(arg))
  //   .optional(),
  webContentLink: z.string().optional(),
  webViewLink: z.string().optional(),
  parents: z.array(z.string()),
  appProperties: z.string().optional(),
  // appProperties: z.record(z.string(), z.string()).optional(),
  // meta: DriveFileMetaSchema.optional(),
})

export const DriveFilesSchema = z.array(DriveFileSchema)

export const CredentialSchema = z.object({
  accessToken: z.string(),
  expiry: z.date(),
  // expiry: z.string().datetime(),
  refreshToken: z.string().nullable(),
  refreshTokenExpiry: z.date(),
  // refreshTokenExpiry: z.string().datetime(),
  createdAt: z.date(),
  // createdAt: z.string().datetime(),
  // createdAt: z
  //   .string()
  //   .or(z.date())
  //   .transform((arg) => new Date(arg)),
  userId: z.number(),
})

export const StatsSchema = z.object({
  id: z.number(),
  count: z.number(),
  lastVisited: z.date(),
  // lastVisited: z.string().datetime(),
  // lastVisited: z
  //   .string()
  //   .or(z.date())
  //   .transform((arg) => new Date(arg)),
  userId: z.number(),
})

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
type Literal = z.infer<typeof literalSchema>
type Json = Literal | { [key: string]: Json } | Json[]
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
)

export const DriveFileDataSchema = z.object({
  fileId: z.string(),
  name: z.string(),
  mimeType: z.string(),
  iconLink: z.string(),
  hasThumbnail: z.boolean(),
  thumbnailLink: z.string().nullable(),
  webViewLink: z.string().nullable(),
  webContentLink: z.string().nullable(),
  parents: z.array(z.string()),
  appProperties: z.string().nullable(),
  createdTime: z.date(),
  // createdTime: z.string().datetime(),
  // createdTime: z
  //   .string()
  //   .or(z.date())
  //   .transform((arg) => new Date(arg)),
  modifiedTime: z.date(),
  // modifiedTime: z.string().datetime(),
  // modifiedTime: z
  //   .string()
  //   .or(z.date())
  //   .transform((arg) => new Date(arg)),
  views: z.number(),
  firstSeen: z.date(),
  // firstSeen: z.string().datetime(),
  lastSeen: z.date(),
  // lastSeen: z.string().datetime(),
  userId: z.number(),
})

export const DriveFileDatasSchema = z.array(DriveFileDataSchema)

export const UserSchema = z.object({
  id: z.number(),
  first: z.string(),
  last: z.string(),
  email: z.string(),
  picture: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  activated: z.boolean(),
  createdAt: z.date(),
  // createdAt: z.string().datetime(),
  // createdAt: z
  //   .string()
  //   .or(z.date())
  //   .transform((arg) => new Date(arg)),

  updatedAt: z.date(),
  // updatedAt: z.string().datetime(),
  // updatedAt: z
  //   .string()
  //   .or(z.date())
  //   .transform((arg) => new Date(arg)),
  credential: CredentialSchema.pick({
    accessToken: true,
    expiry: true,
    refreshToken: true,
    refreshTokenExpiry: true,
    createdAt: true,
  }).nullable(),
  stats: StatsSchema.pick({
    count: true,
    lastVisited: true,
  }).nullable(),
  student: StudentSchema.omit({
    users: true,
  }).nullable(),
  // driveFileData: DriveFileDataSchema.omit({
  //   userId: true,
  // }).array(),
  // driveFileData: DriveFileDataSchema.optional().nullable(),
})

export const UsersSchema = z.array(UserSchema)

/*

z
    .string()
    .or(z.date())
    .transform((arg) => new Date(arg))
    .optional(),

*/
export const PermissionsSchema = z.array(
  z.object({
    id: z.string(),
    displayName: z.string(),
    type: z.string(),
    emailAddress: z.string(),
    role: z.string(),
  }),
)

export const DriveFileMetaSchema = z.object({
  selected: z.boolean().optional(),
  studentFolder: z
    .object({
      folderLink: z.string().optional(),
      folderId: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  destination: z
    .object({
      folderId: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  last: z
    .object({
      folderId: z.string().optional(),
    })
    .optional(),
  file: z
    .object({
      segments: z.array(z.string()).optional(),
      name: z.string().optional(),
      formerName: z.string().optional(),
      studentEmail: z.string().optional(),
      tags: z.string().optional(),
      nendo: z.string().optional(),
    })
    .optional(),
  student: StudentSchema.optional(),
  permissions: PermissionsSchema.optional(),
})

export const TaskSchema = z.object({
  id: z.string(),
  active: z.boolean(),
  time: z.number(),
  type: z.enum(["rename", "move", "create", "delete"]),
  driveFiles: DriveFilesSchema.optional(),
  students: z.array(StudentSchema).optional(),
  driveFile: DriveFileSchema.optional(),
})

export const DriveFileRenameSchema = z.object({
  id: z.string(),
  meta: z.object({
    file: z
      .object({
        segments: z.array(z.string()).optional(),
        name: z.string().optional(),
        formerName: z.string().optional(),
        studentEmail: z.string().optional(),
        tags: z.string().optional(),
        nendo: z.string().optional(),
      })
      .optional(),
  }),
})

export const DriveFileMoveSchema = z.object({
  id: z.string(),
  parents: z.array(z.string()),
  meta: z.object({
    destination: z
      .object({
        folderId: z.string().optional(),
        name: z.string().optional(),
      })
      .optional(),
    last: z
      .object({
        folderId: z.string().optional(),
      })
      .optional(),
  }),
})

export const DriveFileMovesSchema = z.array(DriveFileMoveSchema)

export const DriveFilesRenameSchema = z.array(DriveFileRenameSchema)

export const DriveFileTaskSchema = z.object({
  id: z.string(),
  parents: z.array(z.string()),
  meta: DriveFileMetaSchema,
})
