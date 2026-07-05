"use client"

import * as React from "react"
import { HeaderSearchProvider } from "./header-command-palette"
import { HeaderMoreMenu } from "./header-more-menu"
import { HeaderThemeToggle } from "./header-theme-toggle"
import { useFinePointer } from "@/lib/use-fine-pointer"

/** 「更多」+ 主题切换：下拉菜单右缘与 Header 导航右缘对齐 */
export function HeaderNavActions() {
  const finePointer = useFinePointer()
  const groupRef = React.useRef<HTMLDivElement>(null)
  const [moreOpen, setMoreOpen] = React.useState(false)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const clearCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setMoreOpen(false), 120)
  }

  const handleOpen = () => {
    clearCloseTimer()
    setMoreOpen(true)
  }

  React.useEffect(() => () => clearCloseTimer(), [])

  return (
    <div
      ref={groupRef}
      className="relative flex items-center gap-x-1 sm:gap-x-1.5"
      onPointerEnter={finePointer ? handleOpen : undefined}
      onPointerLeave={finePointer ? scheduleClose : undefined}
    >
      <HeaderSearchProvider>
        <HeaderMoreMenu
          open={moreOpen}
          onOpenChange={setMoreOpen}
          menuGroupRef={groupRef}
        />
      </HeaderSearchProvider>
      <HeaderThemeToggle />
    </div>
  )
}
