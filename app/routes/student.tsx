import MenuIcon from "~/components/icons/MenuIcon"

import { type LoaderArgs, json } from "@remix-run/node"
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react"

import Sidebar from "~/components/student/Sidebar"
import { requireUserSession } from "~/data/session.server"
import { getStudentDataResponse } from "~/data/google.server"
import { getUserWithCredential } from "~/data/user.server"
import { useEffect, useRef, useState } from "react"
import type { Gakunen, Hr, StudentData } from "~/types"

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request)

  try {
    const user = await getUserWithCredential(request)
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

function filterStudentDataByGakunen(
  gakunen: string,
  hr: string,
  studentData: StudentData[]
) {
  if (gakunen === "ALL" && hr === "ALL") {
    return studentData
  } else if (gakunen === "ALL") {
    return studentData.filter((sd) => sd.hr === hr)
  } else if (hr === "ALL") {
    return studentData.filter((sd) => sd.gakunen === gakunen)
  } else {
    return studentData.filter((sd) => sd.gakunen === gakunen && sd.hr === hr)
  }
}

type ContextType = {
  gakunen: Gakunen
  setGakunen: React.Dispatch<React.SetStateAction<Gakunen>>
  hr: Hr
  setHr: React.Dispatch<React.SetStateAction<Hr>>
}

export function useGakunen() {
  return useOutletContext<ContextType>()
}

export default function StudentLayout() {
  const { studentData } = useLoaderData()

  const [filteredStudentData, setFilteredStudentData] = useState(studentData)
  const [gakunen, setGakunen] = useState<Gakunen>("ALL")
  const [hr, setHr] = useState<Hr>("ALL")

  useEffect(() => {
    const tmp = filterStudentDataByGakunen(gakunen, hr, studentData)
    console.log("🚀 routes/student.tsx ~ 	🌈 tmp.length ✨ ", tmp.length)
    setFilteredStudentData(tmp)
  }, [gakunen, studentData, hr])

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
              {/* <!-- end of hidden input checkbox --> */}

              {/* <!-- Right Content --> */}
              <div className='drawer-content flex flex-col items-center justify-start'>
                <div
                  id='_student.student'
                  className='m-12 mx-auto flex h-full w-10/12 flex-col items-center justify-center  sm:w-10/12 md:w-3/4'
                >
                  <Outlet context={{ setGakunen, gakunen, hr, setHr }} />
                </div>
              </div>
              {/* <!-- end of Right Content --> */}

              {/* <!-- SideBar --> */}
              <Sidebar
                studentData={filteredStudentData}
                drawerRef={drawerRef}
              />
              {/* <!-- end of SideBar --> */}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
