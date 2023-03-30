import { Outlet } from "@remix-run/react"

export default function StudentLayout() {
  return (
    <div className='m-12 mx-auto flex h-full w-10/12 flex-col items-center justify-center bg-base-100 sm:w-10/12 md:w-3/4'>
      <Outlet />
    </div>
  )
}
