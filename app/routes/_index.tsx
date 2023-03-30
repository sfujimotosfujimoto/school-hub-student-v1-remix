import LoginButton from "~/components/_index/LoginButton"
import DriveLogo from "~/components/icons/DriveLogo"
import Logo from "~/components/icons/Logo"
import LogoText from "~/components/icons/LogoText"

export default function Index() {
  return (
    <main className='flex justify-center'>
      <div className='mx-auto flex h-screen w-screen max-w-7xl flex-col items-center justify-center gap-8'>
        <div className='flex items-center'>
          <Logo className='h-12 w-12 sm:h-32 sm:w-32' />
          <LogoText className='h-12 w-32 sm:h-32 sm:w-72' />
        </div>

        <div className='max-w-xl rounded-lg bg-base-100 p-4 shadow-lg'>
          <h2 className='text-xl font-semibold'>
            ✨ What is{" "}
            <span className='text-bold  rounded-md bg-sfred-50 px-1 text-indigo-900'>
              <Logo className='inline h-4 w-4' />
              SCHOOL HUB
            </span>
            ?
          </h2>
          <p className='text-normal mt-2 text-base-content '>
            <span className='text-bold rounded-md px-1 text-indigo-900 underline decoration-sfred-200 decoration-2'>
              <Logo className='inline h-3 w-3' />
              SCHOOL HUB
            </span>
            とは生徒の
            <span className='underline decoration-sfred-200 decoration-2'>
              <DriveLogo className='inline h-3 w-3' />
              Google Drive
            </span>{" "}
            と連携するアプリです。
          </p>
        </div>
        <LoginButton />
      </div>
    </main>
  )
}
