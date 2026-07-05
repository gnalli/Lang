"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import { LineChart, Search } from "lucide-react"
import { useHeaderSearch } from "./header-command-palette"
import { useFinePointer } from "@/lib/use-fine-pointer"
import { cn } from "@/lib/utils"

const HeaderAnalyticsDrawer = dynamic(
  () =>
    import("./header-analytics-drawer").then((m) => m.HeaderAnalyticsDrawer),
  { ssr: false },
)

const navLink =
  "inline-flex min-h-9 items-center text-sm leading-snug text-foreground transition-colors hover:text-foreground/70 max-[375px]:text-[0.8125rem] sm:text-base"

const menuItemClass = cn(
  "flex min-h-9 w-full items-center gap-1.5 whitespace-nowrap px-2.5 text-sm text-foreground transition-colors touch-manipulation",
  "hover:bg-foreground/10",
)

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 与主题切换按钮共用的相对定位容器，下拉右缘对齐 Header 导航右缘 */
  menuGroupRef: React.RefObject<HTMLDivElement | null>
}

export function HeaderMoreMenu({ open, onOpenChange, menuGroupRef }: Props) {
  const { openPalette } = useHeaderSearch()
  const finePointer = useFinePointer()
  const [analyticsOpen, setAnalyticsOpen] = React.useState(false)

  const [menuPortalHost, setMenuPortalHost] =
    React.useState<HTMLDivElement | null>(null)

  React.useLayoutEffect(() => {
    if (open) {
      setMenuPortalHost(menuGroupRef.current)
    } else {
      setMenuPortalHost(null)
    }
  }, [open, menuGroupRef])

  React.useEffect(() => {
    if (!open || finePointer) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (menuGroupRef.current?.contains(target)) return
      onOpenChange(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open, finePointer, menuGroupRef, onOpenChange])

  const menuPanel = open ? (
    <div
      className={cn(
        "absolute top-full z-50 w-max pt-2",
        /* 抵消 nav 右 padding（px-2.5 / sm:px-5），与导航栏右缘对齐 */
        "-right-2.5 sm:-right-5",
      )}
      role="menu"
    >
      <div className="w-fit min-w-28 border border-border/70 bg-popover/90 p-1 shadow-md backdrop-blur-xl">
        <button
          type="button"
          role="menuitem"
          className={menuItemClass}
          onClick={() => {
            openPalette()
            onOpenChange(false)
          }}
        >
          <Search className="size-4 opacity-70" strokeWidth={1.75} aria-hidden />
          搜索
        </button>
        <button
          type="button"
          role="menuitem"
          className={menuItemClass}
          onClick={() => {
            setAnalyticsOpen(true)
            onOpenChange(false)
          }}
        >
          <LineChart className="size-4 opacity-70" strokeWidth={1.75} aria-hidden />
          访问趋势
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        type="button"
        className={navLink}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
      >
        更多
      </button>

      {menuPanel && menuPortalHost
        ? createPortal(menuPanel, menuPortalHost)
        : null}

      {analyticsOpen ? (
        <HeaderAnalyticsDrawer
          open={analyticsOpen}
          onOpenChange={setAnalyticsOpen}
        />
      ) : null}
    </>
  )
}
