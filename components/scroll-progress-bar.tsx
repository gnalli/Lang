"use client"

import * as React from "react"

/** 页面顶部阅读进度条：随滚动从左向右填充 */
export function ScrollProgressBar() {
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
        let raf = 0

        const update = () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement
            const max = scrollHeight - clientHeight
            const next = max > 0 ? scrollTop / max : 0
            setProgress(Math.min(1, Math.max(0, next)))
        }

        const onScroll = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(update)
        }

        update()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll, { passive: true })

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
        }
    }, [])

    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-0 z-60 h-[2px] bg-border/30"
        >
            <div
                className="h-full w-full origin-left bg-teal-600 motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out dark:bg-teal-400"
                style={{ transform: `scaleX(${progress})` }}
            />
        </div>
    )
}
