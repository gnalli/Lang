"use client"

import * as React from "react"
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
  "inline-flex min-h-8 items-center text-sm leading-snug text-foreground transition-colors hover:text-foreground/70 max-[375px]:text-[0.8125rem] sm:text-[0.9375rem]"

const menuItemClass = cn(
  "flex min-h-8 w-full items-center gap-1.5 whitespace-nowrap px-2.5 text-sm text-foreground transition-colors touch-manipulation",
  "hover:bg-foreground/10",
)

export function HeaderMoreMenu() {
  const { openPalette } = useHeaderSearch()
  const finePointer = useFinePointer()
  const [open, setOpen] = React.useState(false)
  const [analyticsOpen, setAnalyticsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const clearCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  const handleOpen = () => {
    clearCloseTimer()
    setOpen(true)
  }

  React.useEffect(() => () => clearCloseTimer(), [])

  React.useEffect(() => {
    if (!open || finePointer) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (containerRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open, finePointer])

  return (
    <>
      <div
        ref={containerRef}
        className="relative"
        onPointerEnter={finePointer ? handleOpen : undefined}
        onPointerLeave={finePointer ? scheduleClose : undefined}
      >
        <button
          type="button"
          className={navLink}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((value) => !value)}
        >
          更多
        </button>

        {open ? (
          <div
            className="absolute top-full left-1/2 z-50 w-max -translate-x-1/2 pt-2"
            role="menu"
            onPointerEnter={finePointer ? handleOpen : undefined}
            onPointerLeave={finePointer ? scheduleClose : undefined}
          >
            <div className="w-fit min-w-28 border border-border/70 bg-popover/90 p-1 shadow-md backdrop-blur-xl">
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => {
                  openPalette()
                  setOpen(false)
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
                  setOpen(false)
                }}
              >
                <LineChart className="size-4 opacity-70" strokeWidth={1.75} aria-hidden />
                访问趋势
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {analyticsOpen ? (
        <HeaderAnalyticsDrawer
          open={analyticsOpen}
          onOpenChange={setAnalyticsOpen}
        />
      ) : null}
    </>
  )
}
