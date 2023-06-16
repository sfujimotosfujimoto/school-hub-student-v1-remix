import type { User } from "~/types"

import { Form, NavLink, useLoaderData } from "@remix-run/react"

import ImageIcon from "./ImageIcon"
import { Dashboard, Login, Logout } from "~/components/icons"

export default function NavRight() {
  const user = useLoaderData<User>()

  return (
    <div className="flex">
      <div className="flex items-center flex-grow gap-1 text-xs sm:gap-2 sm:text-base">
        <NavLink
          to="/"
          className={`btn-success btn-xs btn hidden border-0 shadow-md hover:bg-opacity-70 sm:inline-flex`}
        >
          <span className="">Home</span>
        </NavLink>
        {!user && (
          <Form reloadDocument method="post" action="/auth/signin">
            <button
              type="submit"
              className={`btn-success btn-xs btn shadow-md`}
            >
              <Login className="w-5 h-5 sm:hidden" />
              <span className="hidden sm:block">サインイン</span>
            </button>
          </Form>
        )}

        {user && (
          <>
            {user.role === "ADMIN" && (
              <NavLink
                to="/admin"
                className={`btn-warning btn-xs btn  border-0 shadow-md hover:bg-opacity-70 `}
              >
                <Dashboard className="w-5 h-5 sm:hidden " />
                <span className="hidden sm:block">ADMIN</span>
              </NavLink>
            )}
            <Form method="post" action="/auth/signout">
              <button
                type="submit"
                className={`btn-error btn-xs btn  border-0 shadow-md hover:bg-opacity-70`}
              >
                <Logout className="w-5 h-5 sm:hidden" />
                <span className="hidden sm:block">サインアウト</span>
              </button>
            </Form>

            <ImageIcon
              src={user.picture}
              alt="user icon"
              width={24}
              height={24}
            />
          </>
        )}
      </div>
    </div>
  )
}
