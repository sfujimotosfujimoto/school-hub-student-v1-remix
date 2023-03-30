import { Link } from "@remix-run/react"

import Logo from "../icons/Logo"
import LogoText from "../icons/LogoText"

export default function LogoLeft() {
  return (
    <div className='mr-6 flex flex-shrink-0 items-center'>
      <Link to='/' aria-label='Go home' className='mr-2'>
        <Logo className='h-7 w-5 sm:h-12 sm:w-8 lg:w-12' />
      </Link>
      <LogoText className='h-7 w-16 sm:h-10 sm:w-20 lg:h-16 lg:w-24' />
    </div>
  )
}
