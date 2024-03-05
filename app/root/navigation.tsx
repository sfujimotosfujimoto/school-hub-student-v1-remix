import { Form, NavLink, useLocation, useNavigation } from "@remix-run/react"

import clsx from "clsx"
import {
  AvatarIcon,
  DashboardIcon,
  LoginIcon,
  LogoIcon,
  LogoTextIcon,
  UserIcon,
} from "~/components/icons"

export default function Navigation({
  role,
  picture,
  folderId,
}: {
  role: string | null
  picture: string | null
  folderId: string | null
}) {
  let navigation = useNavigation()
  const location = useLocation()

  let loading = navigation.state !== "idle"

  const studentFilePath = `/student/${folderId}`

  return (
    <header className="sticky top-0 z-10 w-screen p-0 border-b navbar border-stone-200 sm:border-0 ">
      <div
        className={clsx(
          `navbar bg-base-100 bg-opacity-70 transition-colors ease-in-out`,
          {
            "pulse-slow bg-opacity-5 bg-gradient-to-r from-sfgreentransparent-400 via-slate-200 via-60%  to-sfredtransparent-400 to-90% duration-500":
              loading,
          },
        )}
      >
        <div className="flex-1">
          <a href="/" className="flex gap-0 text-xl btn btn-ghost btn-sm">
            <LogoIcon
              className={`h-7 w-8 ease-in-out sm:h-8 ${
                loading && "animate-bounce duration-1000"
              }`}
            />
            <LogoTextIcon className="hidden w-20 h-8 sm:block" />
          </a>
        </div>
        <div className="flex-none">
          <ul className="px-1 menu menu-horizontal menu-sm">
            {!role && (
              <li>
                <NavLink to="/auth/signin">
                  <LoginIcon className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:block">サインイン</span>
                </NavLink>
              </li>
            )}
            {role === "ADMIN" && (
              <li>
                <NavLink to="/auth/signin">
                  <DashboardIcon className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:block">ADMIN</span>
                </NavLink>
              </li>
            )}
            {role &&
              folderId &&
              studentFilePath !== location.pathname &&
              !location.pathname.startsWith(studentFilePath) && (
                <li>
                  <NavLink to={studentFilePath}>
                    <UserIcon className="w-5 h-5 sm:hidden" />
                    <span className="hidden sm:block">ファイル一覧</span>
                  </NavLink>
                </li>
              )}
          </ul>
        </div>

        {role && (
          <div className="ml-2 mr-4 dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="avatar btn btn-circle btn-ghost btn-sm"
            >
              {picture ? (
                <div className="w-8 rounded-full">
                  <img
                    alt="Tailwind CSS Navbar component"
                    src={picture || "/avatar.png"}
                  />
                </div>
              ) : (
                <AvatarIcon className="inset-0 " />
              )}
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li>
                <Form method="post" action="/auth/signout" className="">
                  <button type="submit">
                    <LoginIcon className="w-5 h-5 sm:hidden" />
                    <span className="hidden sm:block">サインアウト</span>
                  </button>
                </Form>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}

/*
  return (
    <header className="sticky top-0 z-20 w-screen bg-white border-b border-stone-200 bg-opacity-90 sm:border-0">
      <div className="container mx-auto">
        <nav className="flex flex-wrap items-center justify-between h-full px-4 py-2 sm:px-8">
          <LogoLeft />
          <NavRight />
        </nav>
      </div>
    </header>
  )

*/
