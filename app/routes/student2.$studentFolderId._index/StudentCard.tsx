import { Renew, Time } from "~/components/icons"
import Tags from "~/components/tags"
import {
  checkGoogleMimeType,
  dateFormat,
  parseTags,
  stripText,
} from "~/lib/utils"
import type { DriveFile } from "~/types"

export default function StudentCard({
  driveFile,
  thumbnailSize = "small",
  size = "big",
}: {
  driveFile: DriveFile
  thumbnailSize?: "small" | "big"
  size?: "small" | "big"
}) {
  const appProperties = driveFile.appProperties

  const tags = appProperties?.tags ? parseTags(appProperties.tags) : null
  const nendo = driveFile.appProperties?.nendo

  return (
    <>
      <div
        data-name="StudentCard"
        className={`card bg-sfgreen-200 shadow-lg transition-all duration-500 lg:card-side hover:-translate-y-1 hover:bg-sfgreen-300`}
      >
        <div
          className={`card-body ${
            size === "small" ? "p-2 sm:p-4" : "p-6 sm:p-10"
          }`}
        >
          <h2 className={`card-title ${size === "small" ? "text-sm" : null}`}>
            {stripText(driveFile.name)}
          </h2>

          {/* NENDO & TAGS */}
          <div className="flex gap-2">
            {nendo && (
              <span
                className={`rounded-lg bg-slate-200  px-2 py-1 text-xs font-bold sm:text-sm`}
              >
                {nendo}
              </span>
            )}
            {tags && <Tags tags={tags} />}
          </div>

          <div className="flex items-center justify-center gap-2">
            <img
              src={driveFile.iconLink}
              alt="icon"
              className={` ${size === "small" ? "h-3 w-3" : "h-5 w-5"}`}
            />
            <p className={`${size === "small" ? "text-xs" : "text-sm"}`}>
              {driveFile.mimeType}
            </p>
          </div>

          {size === "big" && (
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <Time className="h-3 w-4" />
                <span>{dateFormat(driveFile.createdTime || "") || ""}</span>
              </div>
              <div className="flex items-center gap-1">
                <Renew className="h-3 w-3" />
                <span>{dateFormat(driveFile.modifiedTime || "") || ""}</span>
              </div>
            </div>
          )}
          {driveFile && size === "big" && (
            <figure className="!rounded-2xl">
              {driveFile.hasThumbnail && !checkGoogleMimeType(driveFile) && (
                <img
                  className="object-contain"
                  src={
                    thumbnailSize === "small"
                      ? driveFile.thumbnailLink
                      : driveFile.thumbnailLink?.split("=")[0]
                  }
                  alt={driveFile.name}
                  referrerPolicy="no-referrer"
                />
              )}
            </figure>
          )}
        </div>
      </div>
    </>
  )
}
