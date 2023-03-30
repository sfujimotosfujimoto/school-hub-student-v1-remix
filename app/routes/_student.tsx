import MenuIcon from "~/components/icons/MenuIcon"

import { type LoaderArgs, json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

import Sidebar from "~/components/_student/Sidebar"
import { requireUserSession } from "~/data/session.server"
import { getStudentDataResponse } from "~/data/google.server"
import { getUserWithCredential } from "~/data/user.server"
import { useRef } from "react"

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request)

  try {
    const user = await getUserWithCredential(request)
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

export default function StudentLayout() {
  const { studentData } = useLoaderData()

  const drawerRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <section className='mx-auto h-screen'>
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
              <label htmlFor='my-drawer'></label>
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
                <Outlet />
              </div>
              {/* <!-- end of Right Content --> */}

              {/* <!-- SideBar --> */}
              <Sidebar studentData={studentData} drawerRef={drawerRef} />
              {/* <!-- end of SideBar --> */}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
