import { Link, useNavigation } from "@remix-run/react"

import Logo from "../icons/Logo"
import LogoText from "../icons/LogoText"

export default function LogoLeft() {
  let navigation = useNavigation()

  let loading = navigation.state === "loading"
  return (
    <div className="mr-6 flex flex-shrink-0 items-center">
      <Link to="/" aria-label="Go home" className="mr-2">
        <Logo
          className={`h-7 w-5 ease-in-out sm:h-12 sm:w-8 lg:w-12 ${
            loading && "animate-bounce"
          }`}
        />
      </Link>
      <Link to="/" aria-label="Go home" className="mr-2">
        <LogoText className="h-7 w-16 sm:h-10 sm:w-20 lg:h-16 lg:w-24" />
      </Link>
    </div>
  )
}
