import MenuIcon from "~/components/icons/MenuIcon"

import { type LoaderArgs, json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

import Sidebar from "~/components/_student/Sidebar"
import { getEmailFromSession, requireUserSession } from "~/data/auth.server"
import { prisma } from "~/data/database.server"
import { getStudentDataResponse } from "~/data/google.server"

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request)
  const email = await getEmailFromSession(request)

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      first: true,
      last: true,

      email: true,
      Credential: {
        select: {
          accessToken: true,
          idToken: true,
          expiryDate: true,
        },
      },
    },
  })

  if (!user || !user.Credential) {
    return json(
      { errorMessage: "User Data not found" },
      {
        status: 401,
      }
    )
  }

  return getStudentDataResponse(user)
}

export default function StudentLayout() {
  const { studentData } = useLoaderData()
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
              <Sidebar studentData={studentData} />
              {/* <!-- end of SideBar --> */}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
