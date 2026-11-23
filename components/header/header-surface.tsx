"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

function readHeaderHeight() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--site-header-height")
  const value = Number.parseFloat(raw)
  if (!Number.isFinite(value)) return 56
  return raw.includes("rem")
    ? value * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    : value
}

/** 顶栏正下方是近期文章或作品（墨色带）。 */
function overHomeInk(headerPx: number) {
  const probe = headerPx + 1
  return [...document.querySelectorAll("[data-home-ink]")].some((band) => {
    const rect = band.getBoundingClientRect()
    return rect.top < probe && rect.bottom > probe
  })
}

type SurfaceState = {
  scrolled: boolean
  home: boolean
  ink: boolean
}

const INITIAL_STATE: SurfaceState = { scrolled: false, home: false, ink: false }

/** 顶部透明。首页滚动后用和当前区块相同的实色，其它页面才加毛玻璃。 */
export function HeaderSurface({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [state, setState] = React.useState<SurfaceState>(INITIAL_STATE)

  React.useEffect(() => {
    let headerPx = readHeaderHeight()
    let rafId = 0

    const compute = () => {
      rafId = 0
      const scrolled = window.scrollY > 8
      const home = pathname === "/" || document.querySelector("[data-home-hero]") != null
      const ink = home && overHomeInk(headerPx)
      setState((prev) =>
        prev.scrolled === scrolled && prev.home === home && prev.ink === ink
          ? prev
          : { scrolled, home, ink },
      )
    }

    const schedule = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(compute)
    }

    const onResize = () => {
      headerPx = readHeaderHeight()
      schedule()
    }

    compute()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", onResize)
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", onResize)
    }
  }, [pathname])

  const { scrolled, home, ink } = state

  return (
    <header
      data-scrolled={scrolled || undefined}
      data-ink={ink || undefined}
      className={cn(
        "sticky top-0 z-50 h-(--site-header-height) w-full border-b transition-[background-color,border-color] duration-300 motion-reduce:transition-none",
        !scrolled
          ? "border-transparent bg-transparent"
          : home
            ? ink
              ? "border-transparent bg-foreground"
              : "border-transparent bg-background"
            : "border-border/70 bg-background/70 backdrop-blur-md supports-backdrop-filter:bg-background/60",
      )}
    >
      {children}
    </header>
  )
}
