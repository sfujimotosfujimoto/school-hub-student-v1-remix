import sharedStyles from "~/styles/shared.css"
import tailwindStyles from "~/styles/tailwind.css"

import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node"
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react"

import Navigation from "./root/navigation2"
import Footer from "./root/footer2"
import ErrorDocument from "./root/error-document"
import { getUserFromSession } from "./lib/services/session.server"

/**
 * LOADER function
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers()
  headers.set("Cache-Control", `private, max-age=${60 * 10}`) // 10 minutes
  const user = await getUserFromSession(request)

  if (!user?.email)
    return json({ role: null, picture: null, folderLink: null, email: null })

  const student = user?.student
  if (!student)
    return json(
      {
        role: user.role,
        picture: user.picture,
        folderLink: null,
        email: user.email,
      },
      { headers },
    )

  return json(
    {
      role: user.role,
      picture: user.picture,
      folderLink: student.folderLink,
      email: user.email,
    },
    { headers },
  )
}

/**
 * META function
 */
export const meta: MetaFunction = () => {
  return [
    {
      title: "SCHOOL HUB STUDENT",
    },
  ]
}

/**
 * LINKS function
 */
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
      rel: "apple-touch-icon",
      sizes: "120x120",
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

/**
 * Component
 */
function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="mytheme">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div
          data-name="root.tsx"
          className="mx-auto grid h-full grid-rows-layout"
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

export function ErrorBoundary() {
  let error = useRouteError()
  const errorMessage = error instanceof Error && error.message

  return (
    <Document>
      <ErrorDocument>
        <h1 className="text-xl">
          Something went wrong. Please try again later.
        </h1>

        <p className="text-lg">{errorMessage && <p>{errorMessage}</p>}</p>

        <p className="text-lg">
          Contact:
          <a
            href="mailto:s-fujimoto@seig-boys.jp"
            className="ml-2 font-semibold underline hover:text-sfred-200 "
          >
            s-fujimoto[at]seig-boys.jp
          </a>
        </p>
        <BackToHomeButton />
      </ErrorDocument>

      <BackToHomeButton />
    </Document>
  )
}

function BackToHomeButton() {
  return (
    <Link
      to="/"
      className={`btn btn-success btn-md hidden border-0 shadow-md hover:bg-opacity-70 sm:inline-flex`}
    >
      Back to Home
    </Link>
  )
}
