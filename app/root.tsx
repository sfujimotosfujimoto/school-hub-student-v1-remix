import sharedStyles from "~/styles/shared.css"
import tailwindStyles from "~/styles/tailwind.css"

import type {
  ErrorBoundaryComponent,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
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

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "SCHOOL HUB",
  viewport: "width=device-width,initial-scale=1",
})

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStyles },
    { rel: "stylesheet", href: sharedStyles },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
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
        <title>{title}</title>
        <Meta />
        <link rel='icon' type='image/x-icon' href='/favicon.svg'></link>
        {/* <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        /> */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        <link
          href='https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@200;300;400;500;700&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&display=swap'
          rel='stylesheet'
        />

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
