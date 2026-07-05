"use client"

import * as React from "react"
import { useSyncExternalStore } from "react"
import { readSiteHeaderHeightPx } from "@/lib/site-header-offset"

/** 与 `SITE_HEADER_OFFSET.headingScrollMargin` / 顶栏 sticky 对齐 */
function useSiteHeaderScrollOffsetPx() {
    return useSyncExternalStore(
        (onStoreChange) => {
            window.addEventListener("resize", onStoreChange)
            return () => window.removeEventListener("resize", onStoreChange)
        },
        () => readSiteHeaderHeightPx(),
        () => 64,
    )
}

export function useActiveTocId(ids: string[]) {
    const scrollOffsetPx = useSiteHeaderScrollOffsetPx()
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
                if (el.getBoundingClientRect().top <= scrollOffsetPx) {
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
    }, [ids, scrollOffsetPx])

    return activeId
}
