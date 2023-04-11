import MenuIcon from "~/components/icons/MenuIcon"

import { type LoaderArgs, json } from "@remix-run/node"
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react"

import Sidebar from "~/components/student/Sidebar"
import { requireUserSession } from "~/lib/session.server"
import { getUserWithCredential } from "~/lib/user.server"
import { useEffect, useRef, useState } from "react"
import type { Gakunen, Hr } from "~/types"
import { filterStudentDataByGakunen } from "~/lib/utils"
import { getStudentDataResponse } from "~/lib/student.server"

/**
 * loader function
 */
export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request)

  try {
    const user = await getUserWithCredential(request)

    // get StudentData[]
    return getStudentDataResponse(user)
  } catch (error) {
    throw json(
      { errorMessage: "User Data not found" },
      {
        status: 401,
      }
    )
  }
}

// type for Outlet Context
type ContextType = {
  gakunen: Gakunen
  setGakunen: React.Dispatch<React.SetStateAction<Gakunen>>
  hr: Hr
  setHr: React.Dispatch<React.SetStateAction<Hr>>
}

export function useGakunen() {
  return useOutletContext<ContextType>()
}

/**
 * Student Layout
 * /student
 * /student/$studentFolderId
 */
export default function StudentLayout() {
  // get StudentData[] from loader()
  const { studentData } = useLoaderData()

  // filtered StudentData[]
  const [filteredStudentData, setFilteredStudentData] = useState(studentData)
  // gakunen state
  const [gakunen, setGakunen] = useState<Gakunen>("ALL")
  // hr state
  const [hr, setHr] = useState<Hr>("ALL")

  // check for change in filteredStudentData
  useEffect(() => {
    const tmp = filterStudentDataByGakunen(gakunen, hr, studentData)
    setFilteredStudentData(tmp)
  }, [gakunen, studentData, hr])

  // used to check click state in hidden checkbox of Sidebar
  const drawerRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <section id="_student" className="mx-auto h-screen">
        <div data-name="__overflow-wrapper" className=" overflow-x-auto">
          {/* <!-- Sidebar Layout --> */}
          <label
            data-name="__hamburger-wrapper"
            htmlFor="my-drawer"
            className="drawer-button btn-success btn-sm  btn absolute left-1 top-11 z-10 shadow-lg hover:bg-sfgreen-400 sm:top-16 lg:hidden"
          >
            <MenuIcon className="h-3 w-3" />
          </label>
          <div className="drawer-mobile drawer">
            {/* <!-- hidden input checkbox --> */}
            <input
              ref={drawerRef}
              id="my-drawer"
              name="my-drawer"
              type="checkbox"
              className="drawer-toggle"
            />

            {/* <!-- Right Content --> */}
            <div
              data-name="__rightside-content"
              className="drawer-content flex flex-col items-center justify-start"
            >
              <Outlet context={{ setGakunen, gakunen, hr, setHr }} />
            </div>

            {/* <!-- SideBar --> */}
            <Sidebar studentData={filteredStudentData} drawerRef={drawerRef} />
          </div>
        </div>
      </section>
    </>
  )
}
