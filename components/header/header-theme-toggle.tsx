"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function HeaderThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex shrink-0 items-center justify-center text-foreground transition-colors hover:text-foreground/70 max-[375px]:scale-90"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      {isDark ? (
        <Sun className="size-[1.125rem]" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="size-[1.125rem]" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  )
}
