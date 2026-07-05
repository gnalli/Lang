import { HeaderNav } from "./header-nav"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex w-full justify-center bg-transparent px-2 pt-1.5 pb-1 sm:pt-2 sm:pb-1">
      <HeaderNav />
    </header>
  )
}
