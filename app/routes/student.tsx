import MenuIcon from "~/components/icons/MenuIcon"

import { type LoaderArgs, json } from "@remix-run/node"
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react"

import Sidebar from "~/components/student/Sidebar"
import { requireUserSession } from "~/data/session.server"
import { getStudentDataResponse } from "~/data/google.server"
import { getUserWithCredential } from "~/data/user.server"
import { useEffect, useRef, useState } from "react"
import type { Gakunen, Hr } from "~/types"
import { filterStudentDataByGakunen } from "~/data/utils"

/**
 * loader function
 */
export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request)

  try {
    const user = await getUserWithCredential(request)


    // TO:
    // get StudentData
    return getStudentDataResponse(user)
  } catch (error) {
    return json(
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

// TODO: should document this Outlet context pattern!
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
      <section id='_student' className='mx-auto h-screen'>
        <div className=' overflow-x-auto'>
          <div className='wrapper'>
            {/* <!-- Sidebar Layout --> */}
            <label
              htmlFor='my-drawer'
              className='btn-success drawer-button btn-sm btn absolute top-11 sm:top-16 left-1 z-10 shadow-lg hover:bg-sfgreen-400 lg:hidden'
            >
              <MenuIcon className='h-3 w-3' />
            </label>
            <div className='drawer-mobile drawer'>
              {/* <!-- hidden input checkbox --> */}
              <input
                ref={drawerRef}
                id='my-drawer'
                name='my-drawer'
                type='checkbox'
                className='drawer-toggle'
              />

              {/* <!-- Right Content --> */}
              <div className='drawer-content flex flex-col items-center justify-start'>
                <Outlet context={{ setGakunen, gakunen, hr, setHr }} />
              </div>

              {/* <!-- SideBar --> */}
              <Sidebar
                studentData={filteredStudentData}
                drawerRef={drawerRef}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
