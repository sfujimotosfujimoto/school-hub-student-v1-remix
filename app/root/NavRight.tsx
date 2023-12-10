import { Form, NavLink, useLoaderData } from "@remix-run/react"

import ImageIcon from "./ImageIcon"
import { Dashboard, Login, Logout, UserIcon } from "~/components/icons"
import { getFolderId } from "~/lib/utils"
import type { loader } from "~/root"

export default function NavRight() {
  const { role, picture, folderLink } = useLoaderData<typeof loader>()

  const studentLink = getFolderId(folderLink || "")

  return (
    <div className="flex">
      <div className="flex flex-grow items-center gap-1 text-xs sm:gap-2 sm:text-base">
        <NavLink
          to="/"
          className={`btn btn-success btn-xs hidden border-0 shadow-md hover:bg-opacity-70 sm:inline-flex`}
        >
          <span className="">ホーム</span>
        </NavLink>
        {!role && (
          <Form reloadDocument method="post" action="/auth/signin">
            <button
              type="submit"
              className={`btn btn-success btn-xs shadow-md`}
            >
              <Login className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:block">サインイン</span>
            </button>
          </Form>
        )}

        {role && (
          <>
            {role === "ADMIN" && (
              <NavLink
                to="/admin"
                className={`btn btn-warning btn-xs  border-0 shadow-md hover:bg-opacity-70 `}
              >
                <Dashboard className="h-5 w-5 sm:hidden " />
                <span className="hidden sm:block">ADMIN</span>
              </NavLink>
            )}
            {studentLink && (
              <NavLink
                to={`/student/${studentLink}`}
                className={`btn btn-success btn-xs  border-0 shadow-md hover:bg-opacity-70 `}
              >
                <UserIcon className="h-5 w-5 sm:hidden" />

                <span className="hidden sm:block">生徒</span>
              </NavLink>
            )}
            <Form method="post" action="/auth/signout">
              <button
                type="submit"
                className={`btn btn-error btn-xs  border-0 shadow-md hover:bg-opacity-70`}
              >
                <Logout className="h-5 w-5 sm:hidden" />
                <span className="hidden sm:block">サインアウト</span>
              </button>
            </Form>

            <ImageIcon src={picture} alt="user icon" width={24} height={24} />
          </>
        )}
      </div>
    </div>
  )
}
