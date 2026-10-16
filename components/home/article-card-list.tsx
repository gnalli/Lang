"use client"

import { useEffect, useRef, type ReactNode } from "react"

function syncSettled(root: HTMLElement) {
  const host = root.closest<HTMLElement>("[data-particle-host]")
  const reveal = host?.getAttribute("data-particle-reveal")
  const hostTop = host?.getBoundingClientRect().top ?? 0
  const line =
    reveal == null || reveal === "full"
      ? Number.POSITIVE_INFINITY
      : hostTop + Number(reveal)

  for (const link of root.querySelectorAll<HTMLElement>("[data-settle-lift]")) {
    const settled = link.getBoundingClientRect().bottom <= line + 0.5
    if (settled) link.setAttribute("data-settled", "")
    else link.removeAttribute("data-settled")
  }
}

export function ArticleCardList({
  className,
  children,
  onSync,
}: {
  className?: string
  children: ReactNode
  /** 成形线刷新之后调用，用来对齐悬停态。 */
  onSync?: () => void
}) {
  const ref = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    let frame = 0
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        syncSettled(root)
        onSync?.()
      })
    }

    schedule()
    const host = root.closest("[data-particle-host]")
    host?.addEventListener("particlescroll", schedule)
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      host?.removeEventListener("particlescroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [onSync])

  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  )
}
