"use client"

import { Search } from "lucide-react"
import { HeaderSearchProvider, useHeaderSearch } from "./header-command-palette"
import { headerIconButtonClass } from "./nav-link-class"

export function HeaderSearch() {
  return (
    <HeaderSearchProvider>
      <HeaderSearchButton />
    </HeaderSearchProvider>
  )
}

function HeaderSearchButton() {
  const { openPalette } = useHeaderSearch()

  return (
    <button
      type="button"
      className={headerIconButtonClass}
      aria-label="搜索"
      onClick={openPalette}
    >
      <Search className="size-4" strokeWidth={1.75} aria-hidden />
    </button>
  )
}
