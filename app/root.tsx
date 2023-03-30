import sharedStyles from "~/styles/shared.css"
import tailwindStyles from "~/styles/tailwind.css"

import type {
  ErrorBoundaryComponent,
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
  useCatch,
} from "@remix-run/react"

import Navigation from "./components/Navigation"
import Error from "./components/util/Error"
import { getUserFromSession } from "./data/auth.server"

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "SCHOOL HUB",
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
      href: "/favicon.svg",
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

export function loader({ request }: LoaderArgs) {
  try {
    return getUserFromSession(request)
  } catch (error) {
    return null
  }
}

function Document({
  title = "",
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <Navigation />
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Document title='SCHOOL HUB'>
      <Outlet />
    </Document>
  )
}

export function CatchBoundary() {
  const caughtResponse = useCatch()
  return (
    <Document title={caughtResponse.statusText}>
      <main>
        <Error>
          <h2 className='text-xl'>
            {caughtResponse.data?.message ||
              "Something went wrong. Please try again later."}
          </h2>
          <Link
            to='/'
            className={`btn-success btn-md btn hidden border-0 shadow-md hover:bg-opacity-70 sm:inline-flex`}
          >
            <span className=''>Home</span>
          </Link>
        </Error>
      </main>
    </Document>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <Document title='An error occurred.'>
      <main>
        <Error>
          <p className='text-2xl'>
            {error.message || "Something went wrong. Please try again later."}
          </p>
          <Link
            to='/'
            className={`btn-success btn-md btn hidden border-0 shadow-md hover:bg-opacity-70 sm:inline-flex`}
          >
            Back to Home
          </Link>
        </Error>
      </main>
    </Document>
  )
}
