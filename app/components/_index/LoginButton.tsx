import { Link, useMatches } from "@remix-run/react"

import Logo from "../icons/Logo"
import Toast from "../util/Toast"

export default function LoginButton() {
  const user = useMatches().filter((m) => m.id === "root")[0]?.data

  return (
    <>
      <div className='relative flex w-full items-center justify-center gap-8 '>
        <Link to='/auth/signin' className={`btn-success btn w-64 shadow-lg`}>
          <Logo className='h-7 w-4' />
          <span className=' ml-2 sm:ml-4 sm:inline'>Sign in to SCHOOL HUB</span>
        </Link>
        {!user && <Toast text='You have to login!' />}
      </div>
    </>
  )
}
