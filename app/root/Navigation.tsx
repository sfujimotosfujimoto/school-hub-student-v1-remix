import LogoLeft from "./LogoLeft"
import NavRight from "./NavRight"

export default function Navigation() {
  return (
    <header className="sticky top-0 z-20 w-screen bg-white border-b border-stone-200 bg-opacity-90 sm:border-0">
      <div className="container mx-auto">
        <nav className="flex flex-wrap items-center justify-between h-full px-4 py-2 sm:px-8">
          <LogoLeft />
          <NavRight />
        </nav>
      </div>
    </header>
  )
}
