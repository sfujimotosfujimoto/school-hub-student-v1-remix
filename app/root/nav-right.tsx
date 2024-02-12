import { Await, Form, useLoaderData } from "@remix-run/react"

import ImageIcon from "./image-icon"
import {
  DashboardIcon,
  LoginIcon,
  LogoutIcon,
  UserIcon,
} from "~/components/icons"
import { getFolderId } from "~/lib/utils"
import type { loader } from "~/root"
import { Button, NavLinkButton } from "~/components/buttons/button"
import { Suspense } from "react"
import SkeletonUI from "~/components/skeleton-ui"

export default function NavRight() {
  const { userPromise } = useLoaderData<typeof loader>()

  // const studentLink = getFolderId(folderLink || "")

  return (
    <div className="flex">
      <div className="flex items-center flex-grow gap-1 text-xs sm:gap-2 sm:text-base">
        <NavLinkButton to="/" size="xs">
          <span className="">ホーム</span>
        </NavLinkButton>

        <Suspense fallback={<SkeletonUI />}>
          <Await resolve={userPromise} errorElement={<h1>Error....</h1>}>
            {({ user, refreshUser }) => {
              const role = user?.role
                ? user.role
                : refreshUser?.role
                  ? refreshUser.role
                  : null
              const picture = user?.picture
                ? user.picture
                : refreshUser?.picture
                  ? refreshUser.picture
                  : ""
              const folderLink = user?.student
                ? user.student.folderLink
                : refreshUser?.student
                  ? refreshUser.student.folderLink
                  : null
              const studentLink = getFolderId(folderLink || "")

              return (
                <>
                  {!role && (
                    <NavLinkButton
                      to="/auth/signin"
                      variant="primary"
                      size="xs"
                    >
                      <LoginIcon className="w-5 h-5 sm:hidden" />
                      <span className="hidden sm:block">サインイン</span>
                    </NavLinkButton>
                  )}

                  {role && (
                    <>
                      {role === "ADMIN" && (
                        <NavLinkButton to="/admin" size="xs">
                          <DashboardIcon className="w-5 h-5 sm:hidden " />
                          <span className="hidden sm:block">ADMIN</span>
                        </NavLinkButton>
                      )}
                      {studentLink && (
                        <NavLinkButton to={`/student/${studentLink}`} size="xs">
                          <UserIcon className="w-5 h-5 sm:hidden" />
                          <span className="hidden sm:block">生徒</span>
                        </NavLinkButton>
                      )}
                      <Form method="post" action="/auth/signout">
                        <Button type="submit" variant="secondary" size="xs">
                          <LogoutIcon className="w-5 h-5 sm:hidden" />
                          <span className="hidden sm:block">サインアウト</span>
                        </Button>
                      </Form>

                      <ImageIcon
                        src={picture}
                        alt="user icon"
                        width={24}
                        height={24}
                      />
                    </>
                  )}
                </>
              )
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  )
}
