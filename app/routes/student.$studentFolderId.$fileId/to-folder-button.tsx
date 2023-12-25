import { AButton } from "~/components/buttons/button"
import FolderIcon from "~/components/icons/folder-icon"

export default function ToFolderBtn({ parentId }: { parentId: string }) {
  return (
    <AButton
      href={`https://drive.google.com/drive/folders/${parentId}`}
      size="sm"
    >
      <div className="flex items-center justify-center">
        <FolderIcon className="mr-2 h-6 w-6" />
        フォルダへ
      </div>
    </AButton>
  )
}
