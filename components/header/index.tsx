import { HeaderNav } from "./header-nav"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex w-full justify-center bg-transparent px-2 pt-2 pb-1.5 sm:pt-3 sm:pb-1.5">
      <HeaderNav />
    </header>
  )
}
