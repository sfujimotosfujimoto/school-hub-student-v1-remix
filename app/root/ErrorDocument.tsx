import ErrorIcon from "../components/icons/ErrorIcon"

export default function ErrorDocument({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex justify-center">
      <div className="mx-auto flex h-screen max-w-7xl flex-col items-center justify-center gap-8">
        <div className="flex items-center">
          <ErrorIcon className="h-12 w-12 text-sfred-300 sm:h-24 sm:w-24" />
        </div>
        {children}
      </div>
    </main>
  )
}
