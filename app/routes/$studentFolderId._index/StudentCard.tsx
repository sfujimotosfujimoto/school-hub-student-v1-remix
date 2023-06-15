import { Renew, Time } from "~/components/icons"
import type { DriveFileData } from "~/types"

export function dateFormat(dateString: string) {
  const date = new Date(dateString)

  const output = new Intl.DateTimeFormat("ja", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)

  return output
}

export default function StudentCard({
  rowData,
  thumbnailSize = "small",
}: {
  rowData: DriveFileData
  thumbnailSize?: "small" | "big"
}) {
  return (
    <>
      {/* <a id="_StudentCard" href={`/student/${studentFolderId}/${rowData.id}`}> */}
      <div className="card  bg-sfgreen-200 shadow-lg transition-all duration-500 lg:card-side hover:-translate-y-1 hover:bg-sfred-50">
        <div className="card-body">
          <h2 className="card-title">{rowData.name}</h2>
          <div className="flex items-center justify-center gap-2">
            <img src={rowData.iconLink} alt="icon" className="h-5 w-5" />
            <p>{rowData.mimeType}</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <Time className="h-3 w-4" />
              <span>{dateFormat(rowData.createdTime || "") || ""}</span>
            </div>
            <div className="flex items-center gap-1">
              <Renew className="h-3 w-3" />
              <span>{dateFormat(rowData.modifiedTime || "") || ""}</span>
            </div>
          </div>
          {rowData && (
            <figure className="!rounded-2xl">
              {rowData.hasThumbnail && (
                // TODO: check hardcoded: "https://lh"
                // rowData.thumbnailLink.startsWith("https://lh") && (
                <img
                  className="object-contain"
                  src={
                    thumbnailSize === "small"
                      ? rowData.thumbnailLink
                      : rowData.thumbnailLink?.split("=")[0]
                  }
                  alt={rowData.name}
                />
              )}
            </figure>
          )}
        </div>
      </div>
      {/* </a> */}
    </>
  )
}
