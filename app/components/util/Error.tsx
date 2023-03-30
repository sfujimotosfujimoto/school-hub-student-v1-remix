import ErrorIcon from "../icons/ErrorIcon"

function Error({ children }: { children: React.ReactNode }) {
  return (
    <main className='flex justify-center'>
      <div className='mx-auto flex h-screen w-screen max-w-7xl flex-col items-center justify-center gap-8'>
        <div className='flex items-center'>
          <ErrorIcon className='h-24 w-24 sm:h-48 sm:w-48 text-sfred-300' />
        </div>

        {children}
      </div>
    </main>
  )
}

export default Error
