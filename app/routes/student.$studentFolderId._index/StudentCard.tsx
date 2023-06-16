import { Renew, Time } from "~/components/icons"
import { checkGoogleMimeType, dateFormat, stripText } from "~/lib/utils"
import type { DriveFileData } from "~/types"

export default function StudentCard({
  driveFileDatum,
  thumbnailSize = "small",
  size = "big",
}: {
  driveFileDatum: DriveFileData
  thumbnailSize?: "small" | "big"
  size?: "small" | "big"
}) {
  return (
    <>
      <div
        data-name="StudentCard"
        className={`card bg-sfgreen-200 shadow-lg lg:card-side ${
          size === "big"
            ? "l transition-all duration-500 hover:-translate-y-1 hover:bg-sfred-50"
            : null
        }`}
      >
        <div
          className={`card-body p-6 sm:p-10  ${
            size === "small" ? "p-2 sm:p-4" : "p-6 sm:p-10"
          }`}
        >
          <h2 className={`card-title ${size === "small" ? "text-sm" : null}`}>
            {stripText(driveFileDatum.name)}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <img
              src={driveFileDatum.iconLink}
              alt="icon"
              className={` ${size === "small" ? "h-3 w-3" : "h-5 w-5"}`}
            />
            <p className={`${size === "small" ? "text-xs" : "text-sm"}`}>
              {driveFileDatum.mimeType}
            </p>
          </div>

          {size === "big" && (
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <Time className="w-4 h-3" />
                <span>
                  {dateFormat(driveFileDatum.createdTime || "") || ""}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Renew className="w-3 h-3" />
                <span>
                  {dateFormat(driveFileDatum.modifiedTime || "") || ""}
                </span>
              </div>
            </div>
          )}
          {driveFileDatum && size === "big" && (
            <figure className="!rounded-2xl">
              {driveFileDatum.hasThumbnail &&
                !checkGoogleMimeType(driveFileDatum) && (
                  <img
                    className="object-contain"
                    src={
                      thumbnailSize === "small"
                        ? driveFileDatum.thumbnailLink
                        : driveFileDatum.thumbnailLink?.split("=")[0]
                    }
                    alt={driveFileDatum.name}
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
