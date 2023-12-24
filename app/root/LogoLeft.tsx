import { Link, useNavigation } from "@remix-run/react"

import { LogoTextIcon, LogoIcon } from "~/components/icons"

export default function LogoLeft() {
  let navigation = useNavigation()

  let loading = navigation.state !== "idle"
  return (
    <div className="mr-6 flex flex-shrink-0 items-center">
      <Link to="/" aria-label="Go home" className="mr-2">
        <LogoIcon
          className={`h-9 w-8 ease-in-out sm:h-12 ${
            loading && "animate-bounce"
          }`}
        />
      </Link>
      <Link to="/" aria-label="Go home" className="mr-2">
        <LogoTextIcon className="h-10 w-20 sm:block" />
      </Link>
    </div>
  )
}
