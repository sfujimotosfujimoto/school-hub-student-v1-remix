import LogoLeft from "./LogoLeft"
import NavRight from "./NavRight"

export default function Navigation() {
  return (
    <header className='fixed top-0 left-0 h-[var(--header-height)] w-full border-b border-stone-200 bg-white bg-opacity-90 sm:relative sm:border-0'>
      <div className='max-w-9xl container mx-auto h-full'>
        <nav className='relative flex h-full flex-wrap items-center justify-between px-4 py-2'>
          <LogoLeft />
          <NavRight />
        </nav>
      </div>
    </header>
  )
}
