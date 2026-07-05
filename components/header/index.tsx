import { HeaderNav } from "./header-nav"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex w-full justify-center bg-transparent px-2 pt-1 pb-0.5 sm:pt-1.5 sm:pb-0.5">
      <HeaderNav />
    </header>
  )
}
