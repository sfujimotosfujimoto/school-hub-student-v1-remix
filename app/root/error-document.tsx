import ErrorIcon from "../components/icons/error-icon"

export default function ErrorDocument({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex justify-center h-full">
      <div className="flex flex-col items-center justify-center h-full gap-8 mx-auto max-w-7xl">
        <div className="flex items-center">
          <ErrorIcon className="w-12 h-12 text-sfred-300 sm:h-24 sm:w-24" />
        </div>
        {children}
      </div>
    </main>
  )
}
