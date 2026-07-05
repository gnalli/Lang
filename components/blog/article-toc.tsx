"use client"

import * as React from "react"

/** 与 `blog-article-prose` 里 `prose-headings:scroll-mt-24` / 顶栏 sticky 对齐 */
const SCROLL_ACTIVE_OFFSET_PX = 96

export function useActiveTocId(ids: string[]) {
    const [activeId, setActiveId] = React.useState<string | null>(() =>
        ids.length > 0 ? ids[0]! : null,
    )

    React.useEffect(() => {
        if (ids.length === 0) {
            setActiveId(null)
            return
        }

        const resolveElements = () =>
            ids
                .map((id) => document.getElementById(id))
                .filter((el): el is HTMLElement => el !== null)

        if (resolveElements().length === 0) {
            setActiveId(ids[0] ?? null)
            return
        }

        let raf = 0

        const update = () => {
            const els = ids
                .map((id) => document.getElementById(id))
                .filter((el): el is HTMLElement => el !== null)
            if (els.length === 0) {
                setActiveId(ids[0] ?? null)
                return
            }
            let next: string | null = els[0]!.id
            for (const el of els) {
                if (el.getBoundingClientRect().top <= SCROLL_ACTIVE_OFFSET_PX) {
                    next = el.id
                }
            }
            setActiveId((prev) => (prev === next ? prev : next))
        }

        const onScrollOrResize = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(update)
        }

        update()
        window.addEventListener("scroll", onScrollOrResize, { passive: true })
        window.addEventListener("resize", onScrollOrResize)

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("scroll", onScrollOrResize)
            window.removeEventListener("resize", onScrollOrResize)
        }
    }, [ids])

    return activeId
}
