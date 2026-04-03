"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"

type Props = {
    children: ReactNode
    /** 目录下方区域，如回到顶部按钮 */
    footer?: ReactNode
    /** 与固定顶栏（h-16）+ 间距一致，默认 6rem */
    top?: string
    /** 与视口底边的间距 */
    bottom?: string
}

/**
 * 侧栏固定区：上为可滚动目录，下为 footer（回顶按钮），与目录列同宽对齐。
 */
export function FixedTocSlot({ children, footer, top = "6rem", bottom = "1.5rem" }: Props) {
    const anchorRef = useRef<HTMLDivElement>(null)
    const [box, setBox] = useState<{ left: number; width: number } | null>(null)

    useLayoutEffect(() => {
        const anchor = anchorRef.current
        if (!anchor) return

        const update = () => {
            const r = anchor.getBoundingClientRect()
            setBox({ left: r.left, width: r.width })
        }

        update()
        const ro = new ResizeObserver(update)
        ro.observe(anchor)
        window.addEventListener("resize", update)

        return () => {
            ro.disconnect()
            window.removeEventListener("resize", update)
        }
    }, [])

    return (
        <>
            <div
                ref={anchorRef}
                className="hidden min-h-px w-full min-w-[200px] max-w-[260px] lg:block"
                aria-hidden
            />
            <div
                className="pointer-events-none fixed z-30 hidden flex-col lg:pointer-events-auto lg:flex"
                style={
                    box
                        ? {
                            top,
                            bottom,
                            left: box.left,
                            width: box.width,
                        }
                        : { visibility: "hidden" }
                }
            >
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
                {footer ? (
                    <div className="pointer-events-auto mt-4 flex shrink-0 justify-start  pr-10 pt-4 sm:pr-14">
                        {footer}
                    </div>
                ) : null}
            </div>
        </>
    )
}
