"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true })
  window.addEventListener("resize", onChange)
  return () => {
    window.removeEventListener("scroll", onChange)
    window.removeEventListener("resize", onChange)
  }
}

function headerHeight() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--site-header-height")
  const value = Number.parseFloat(raw)
  if (!Number.isFinite(value)) return 68
  return raw.includes("rem")
    ? value * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    : value
}

/** 顶栏正下方是近期文章或作品（墨色带）。 */
function overHomeInk() {
  const probe = headerHeight() + 1
  return [...document.querySelectorAll("[data-home-ink]")].some((band) => {
    const rect = band.getBoundingClientRect()
    return rect.top < probe && rect.bottom > probe
  })
}

function onHomePage() {
  return document.querySelector("[data-home-hero]") != null
}

/** 顶部透明。首页滚动后用和当前区块相同的实色，其它页面才加毛玻璃。 */
export function HeaderSurface({ children }: { children: React.ReactNode }) {
  const scrolled = React.useSyncExternalStore(
    subscribe,
    () => window.scrollY > 8,
    () => false,
  )
  const home = React.useSyncExternalStore(subscribe, onHomePage, () => false)
  const ink = React.useSyncExternalStore(subscribe, overHomeInk, () => false)

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
