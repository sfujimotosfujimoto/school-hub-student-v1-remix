import sharedStyles from "~/styles/shared.css"
import tailwindStyles from "~/styles/tailwind.css"
import { Analytics } from "@vercel/analytics/react"
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node"
import {
  isRouteErrorResponse,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react"

import Navigation from "./root/navigation"
import Footer from "./root/footer"
import ErrorDocument from "./root/error-document"
import { getSession } from "./lib/services/session.server"
import { logger } from "./lib/logger"
import { PageTransitionProgressBar } from "./components/progress-bar"

/**
 * LOADER function
 */
export async function loader({ request }: LoaderFunctionArgs) {
  logger.debug(`🍿 loader: root ${request.url}`)

  const { email, role, picture, folderId } = await getSession(request)

  return json({
    role,
    picture,
    email,
    folderId,
  })
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
      sizes: "152x152",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "144x144",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "120x120",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "114x114",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "76x76",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "72x72",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "60x60",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "57x57",
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
  const { role, picture, folderId } = useLoaderData<typeof loader>()
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
          className="grid h-full mx-auto grid-rows-layout"
        >
          <PageTransitionProgressBar />

          <Navigation role={role} picture={picture} folderId={folderId} />
          <main className="h-full">{children}</main>
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <Analytics />
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
  console.error("root error:", error)

  return (
    <html lang="en" data-theme="mytheme">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorDocument>
          <h1 className="text-xl text-sfblue-300">
            Something went wrong. Please try again later.
          </h1>
          <h2 className="text-lg text-sfblue-300">
            {isRouteErrorResponse(error)
              ? `${error.status} ${error.statusText}`
              : error instanceof Error
                ? error.message
                : "Unknown Error"}
          </h2>

          <p className="text-lg">
            Contact:
            <a
              href="mailto:sfujimotosfujimoto@gmail.com"
              className="ml-2 font-semibold underline hover:text-sfred-200 "
            >
              sfujimotosfujimoto[at]gmail.com
            </a>
          </p>
          <BackToHomeButton />
        </ErrorDocument>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <Analytics />
      </body>
    </html>
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

/*

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
            ? error.message
            : "Unknown Error"}
        </h1>
        <Scripts />
      </body>
    </html>
  );
}

*/
