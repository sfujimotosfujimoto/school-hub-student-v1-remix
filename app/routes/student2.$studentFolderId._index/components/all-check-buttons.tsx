import type { DriveFile } from "~/types"
import type { Role } from "@prisma/client"
import { CheckIcon, XIcon } from "~/components/icons"
import { useDriveFilesContext } from "~/context/drive-files-context"

export default function AllCheckButtons({
  role,
  baseDriveFiles,
}: {
  role?: Role
  baseDriveFiles: DriveFile[]
}) {
  const { driveFilesDispatch } = useDriveFilesContext()
  const btnCls = `btn-xs border-none btn shadow-md bg-sfred-200 duration-300 hover:-translate-y-[1px] hover:bg-sfred-400`

  return (
    <div data-name="AllCheckButtons.tsx">
      <div className={`flex flex-wrap items-center gap-2`}>
        {role && ["ADMIN", "SUPER"].includes(role) && (
          <>
            {/* ALL BUTTON */}
            <span
              onClick={() => {
                driveFilesDispatch({
                  type: "SET",
                  payload: { driveFiles: baseDriveFiles },
                })
              }}
              className={btnCls}
              role="button"
              tabIndex={0}
            >
              ALL
            </span>
            <div className="divider divider-horizontal ml-0 mr-0" />
          </>
        )}
      </div>
    </div>
  )
}
