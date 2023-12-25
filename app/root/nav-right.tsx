import { Form, useLoaderData } from "@remix-run/react"

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

export default function NavRight() {
  const { role, picture, folderLink } = useLoaderData<typeof loader>()

  const studentLink = getFolderId(folderLink || "")

  return (
    <div className="flex">
      <div className="flex flex-grow items-center gap-1 text-xs sm:gap-2 sm:text-base">
        <NavLinkButton to="/" size="xs">
          <span className="">ホーム</span>
        </NavLinkButton>
        {!role && (
          <Form reloadDocument method="post" action="/auth/signin">
            <Button type="submit" variant="primary" size="xs">
              <LoginIcon className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:block">サインイン</span>
            </Button>
          </Form>
        )}

        {role && (
          <>
            {role === "ADMIN" && (
              <NavLinkButton to="/admin" size="xs">
                <DashboardIcon className="h-5 w-5 sm:hidden " />
                <span className="hidden sm:block">ADMIN</span>
              </NavLinkButton>
            )}
            {studentLink && (
              <NavLinkButton to={`/student/${studentLink}`} size="xs">
                <UserIcon className="h-5 w-5 sm:hidden" />
                <span className="hidden sm:block">生徒</span>
              </NavLinkButton>
            )}
            <Form method="post" action="/auth/signout">
              <Button type="submit" variant="secondary" size="xs">
                <LogoutIcon className="h-5 w-5 sm:hidden" />
                <span className="hidden sm:block">サインアウト</span>
              </Button>
            </Form>

            <ImageIcon src={picture} alt="user icon" width={24} height={24} />
          </>
        )}
      </div>
    </div>
  )
}
