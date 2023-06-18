import sharedStyles from "~/styles/shared.css"
import tailwindStyles from "~/styles/tailwind.css"

import type {
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node"
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react"

import Navigation from "./root/Navigation"
import ErrorDocument from "./root/ErrorDocument"
import * as sessionS from "./lib/session.server"
import Footer from "./root/Footer"
import * as sheetsS from "./lib/google/sheets.server"

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div
          data-name="root.tsx"
          className="grid h-full mx-auto grid-rows-layout"
        >
          <Navigation />
          <main className="h-full">{children}</main>
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

export async function loader({ request }: LoaderArgs) {
  const user = await sessionS.getUserFromSession(request)

  if (!user?.email) return { user: null, student: null }

  const student = await sheetsS.getStudentDatumByEmail(user?.email)

  if (!student) return { user, student: null }

  return { user, student }
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "SCHOOL HUB STUDENT",
    },
  ]
}

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStyles },
    { rel: "stylesheet", href: sharedStyles },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      href: "/favicon.ico",
      type: "image/x-icon",
    },
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@200;300;400;500;700&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&display=swap",
    },
  ]
}

export function ErrorBoundary() {
  console.log("🚀 app/root.tsx ~ 	✨ in ErrorBoundary")
  let error = useRouteError()

  if (isRouteErrorResponse(error)) {
    let errorMessage = "An error occurred."
    console.log("🚀 app/root.tsx ~ 	🌈 error ✨ ", error, typeof error.status)

    switch (error.status) {
      case 401: {
        errorMessage = "You are not authorized."
        break
      }
      case 403: {
        errorMessage = "You are not authenticated."
        break
      }
      case 500: {
        errorMessage = "Something went wrong in the server."
        break
      }
      default: {
        errorMessage = "Something went wrong. (default)"
      }
    }

    return (
      <Document>
        <main data-name="root">
          <ErrorDocument>
            <h1 className="text-xl">
              {`${errorMessage} : ${error.status}` ||
                "Something went wrong. Please try again later."}
            </h1>
            <p className="text-lg text-center">{error.statusText}</p>

            <p className="text-lg">
              Contact:
              <a
                href="mailto:s-fujimoto@seig-boys.jp"
                className="ml-2 font-semibold underline hover:text-sfred-200 "
              >
                s-fujimoto[at]seig-boys.jp
              </a>
            </p>
            <Link
              to="/"
              className={`btn-success btn-md btn hidden border-0 shadow-md hover:bg-opacity-70 sm:inline-flex`}
            >
              Back to Home
            </Link>
          </ErrorDocument>
        </main>
      </Document>
    )
  } else if (error instanceof Error) {
    console.error("🚀 app/root.tsx ~ 	🌈 error ✨ ", error.message)
    return (
      <Document>
        <main>
          <ErrorDocument>
            <p className="text-2xl">{"Something went wrong."}</p>
            <Link
              to="/"
              className={`btn-success btn-md btn hidden border-0 shadow-md hover:bg-opacity-70 sm:inline-flex`}
            >
              Back to Home
            </Link>
          </ErrorDocument>
        </main>
      </Document>
    )
  } else {
    return (
      <Document>
        <main>
          <ErrorDocument>
            <h1 className="text-2xl">Unknown Error</h1>
            <Link
              to="/"
              className={`btn-success btn-md btn hidden border-0 shadow-md hover:bg-opacity-70 sm:inline-flex`}
            >
              Back to Home
            </Link>
          </ErrorDocument>
        </main>
      </Document>
    )
  }
}
