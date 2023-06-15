import FolderIcon from "../../components/icons/FolderIcon"

export default function ToFolderBtn({ parentId }: { parentId: string }) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`https://drive.google.com/drive/folders/${parentId}`}
      className={`  h-full rounded-lg bg-sfgreen-200 px-2 py-3 shadow-md transition-all duration-500  hover:-translate-y-1 hover:bg-sfgreen-400`}
    >
      <div className="flex items-center justify-center">
        <FolderIcon class="mr-2 h-6 w-6" />
        フォルダへ
      </div>
    </a>
  )
}
