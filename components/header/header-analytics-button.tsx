"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { LineChart } from "lucide-react"
import { headerIconButtonClass } from "./nav-link-class"

const HeaderAnalyticsDrawer = dynamic(
  () => import("./header-analytics-drawer").then((m) => m.HeaderAnalyticsDrawer),
  { ssr: false },
)

export function HeaderAnalyticsButton() {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  return (
    <>
      <button
        type="button"
        className={headerIconButtonClass}
        aria-label="访问趋势"
        onClick={() => {
          setMounted(true)
          setOpen(true)
        }}
      >
        <LineChart className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
      {mounted ? <HeaderAnalyticsDrawer open={open} onOpenChange={setOpen} /> : null}
    </>
  )
}
