import type { UserBase } from "~/types"

import { Form, NavLink, useLoaderData } from "@remix-run/react"

import ImageIcon from "../util/ImageIcon"

export default function NavRight() {
  const user = useLoaderData<UserBase>()

  return (
    <div className='flex'>
      <div className='flex flex-grow items-center gap-1 text-xs sm:gap-2 sm:text-base'>
        <NavLink
          to='/'
          className={`btn-success btn-xs btn hidden border-0 shadow-md hover:bg-opacity-70 sm:inline-flex`}
        >
          <span className=''>Home</span>
        </NavLink>
        {!user && (
          <a href='/auth/signin' className={`btn-success btn-xs btn shadow-md`}>
            <span className=''>Sign in</span>
          </a>
        )}
        {user && (
          <>
            <NavLink
              to='/student'
              className={`btn-success btn-xs btn  border-0 shadow-md hover:bg-opacity-70 `}
            >
              <span className=''>Students </span>
            </NavLink>
            <Form method='post' action='/auth/signout'>
              <button
                type='submit'
                className={`btn-error btn-xs btn  border-0 shadow-md hover:bg-opacity-70`}
              >
                Sign out
              </button>
            </Form>

            <ImageIcon
              src={user.picture}
              alt='user icon'
              width={24}
              height={24}
            />
          </>
        )}
      </div>
    </div>
  )
}
