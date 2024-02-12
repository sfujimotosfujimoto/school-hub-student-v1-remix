import { isRouteErrorResponse, useRouteError } from "@remix-run/react"
import { ErrorIcon } from "./icons"
import BackButton from "./back-button"
// import { getErrorMessage } from "~/lib/utils"

export default function ErrorBoundaryDocument({
  heading = "Something went wrong",
  message,
  toHome = false,
}: {
  heading?: string
  message: string
  toHome?: boolean
}) {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    console.error("✅ error: ", error)
    // message = getErrorMessage(error.data)
    message = error.data
  }
  return (
    <main className="flex justify-center h-full">
      <div className="flex flex-col items-center justify-center h-full gap-4 mx-auto max-w-7xl">
        <div className="flex items-center">
          <ErrorIcon className="w-20 h-20 text-sfred-300 sm:h-24 sm:w-24" />
        </div>
        <h2 className="text-2xl">{heading}</h2>
        <p className="text-lg">{message}</p>
        {toHome ? <BackButton to="/" /> : <BackButton />}
      </div>
    </main>
  )
}
