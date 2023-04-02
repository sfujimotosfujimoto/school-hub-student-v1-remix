import { Form, useMatches, useSearchParams } from "@remix-run/react"

import Logo from "../icons/Logo"
import Toast from "../util/Toast"

export default function LoginButton() {
  const user = useMatches().filter((m) => m.id === "root")[0]?.data

  const [params] = useSearchParams()

  const login = params.get("login")
  const expired = params.get("expired")

  return (
    <>
      <div className='relative flex w-full items-center justify-center gap-8 '>
        {!user ? (
          <a href='/auth/signin' className={`btn-success btn w-64 shadow-lg`}>
            <Logo className='h-7 w-4' />
            <span className=' ml-2 sm:ml-4 sm:inline'>
              Sign in to SCHOOL HUB
            </span>
          </a>
        ) : (
          <Form method='post' action='/auth/signout'>
            <button
              type='submit'
              className={`btn-error btn w-64  border-0 shadow-lg hover:bg-opacity-70`}
            >
              <Logo className='h-7 w-4' />
              <span className=' ml-1 sm:ml-2 sm:inline'>
                Sign out of SCHOOL HUB
              </span>
            </button>
          </Form>
        )}
        {login === "false" && <Toast text='You have to login!' />}
        {expired && <Toast text='Your token has expired!' />}
        {!user && <Toast text='You have to login!' />}
      </div>
    </>
  )
}
