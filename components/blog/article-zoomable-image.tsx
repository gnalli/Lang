"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { getProxiedImageSrcForBrowser } from "@/lib/proxied-image-src"
import { cn } from "@/lib/utils"

function normalizeImgSrc(src: React.ComponentPropsWithoutRef<"img">["src"]): string {
    if (typeof src === "string") return src.trim()
    if (src == null) return ""
    return String(src)
}

/** MDX `img`：Portal 预览；打开时锁定背后滚动；滚轮 / 滑动结束预览（不滚后面页面） */
export function ArticleZoomableImage(
    props: React.ComponentPropsWithoutRef<"img">,
) {
    const { className, src, alt, title, ...rest } = props
    const [open, setOpen] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const overlayRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open])

    React.useEffect(() => {
        if (!open) return
        const body = document.body
        const html = document.documentElement
        const scrollY = window.scrollY
        const scrollbarWidth = window.innerWidth - html.clientWidth

        const prev = {
            position: body.style.position,
            top: body.style.top,
            left: body.style.left,
            right: body.style.right,
            overflow: body.style.overflow,
            paddingRight: body.style.paddingRight,
        }

        body.style.position = "fixed"
        body.style.top = `-${scrollY}px`
        body.style.left = "0"
        body.style.right = "0"
        body.style.overflow = "hidden"
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`
        }

        return () => {
            body.style.position = prev.position
            body.style.top = prev.top
            body.style.left = prev.left
            body.style.right = prev.right
            body.style.overflow = prev.overflow
            body.style.paddingRight = prev.paddingRight
            window.scrollTo(0, scrollY)
        }
    }, [open])

    React.useEffect(() => {
        if (!open) return
        const el = overlayRef.current
        if (!el) return

        const dismiss = () => setOpen(false)

        const onWheel = (e: WheelEvent) => {
            e.preventDefault()
            dismiss()
        }

        let touchStartY = 0
        const onTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0]?.clientY ?? 0
        }
        const onTouchMove = (e: TouchEvent) => {
            const y = e.touches[0]?.clientY
            if (y === undefined) return
            if (Math.abs(y - touchStartY) > 20) {
                if (e.cancelable) e.preventDefault()
                dismiss()
            }
        }

        el.addEventListener("wheel", onWheel, { passive: false })
        el.addEventListener("touchstart", onTouchStart, {
            passive: true,
            capture: true,
        })
        el.addEventListener("touchmove", onTouchMove, {
            passive: false,
            capture: true,
        })

        return () => {
            el.removeEventListener("wheel", onWheel)
            el.removeEventListener("touchstart", onTouchStart, true)
            el.removeEventListener("touchmove", onTouchMove, true)
        }
    }, [open])

    const srcStr = normalizeImgSrc(src)
    if (!srcStr) {
        return null
    }

    /** 同源代理，避免浏览器对 CDN 直链的 403/CORS 与 curl 不一致 */
    const displaySrc = getProxiedImageSrcForBrowser(srcStr)

    const label = alt?.trim() ? `查看大图：${alt}` : "查看大图"

    const layer =
        mounted && open ? (
            <div
                ref={overlayRef}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-black/80 p-3 backdrop-blur-[1px] overscroll-none touch-none"
                onClick={() => setOpen(false)}
            >
                <button
                    type="button"
                    aria-label="点击关闭大图"
                    className="max-h-[min(85dvh,100%)] max-w-full shrink-0 cursor-zoom-out border-0 bg-transparent p-0 touch-auto"
                    onClick={(e) => {
                        e.stopPropagation()
                        setOpen(false)
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        {...rest}
                        src={displaySrc}
                        alt={alt ?? ""}
                        className="max-h-[min(85dvh,100%)] w-auto max-w-full rounded-md object-contain pointer-events-none"
                        decoding="async"
                        fetchPriority="high"
                        loading="eager"
                    />
                </button>
            </div>
        ) : null

    return (
        <>
            <span
                role="button"
                tabIndex={0}
                aria-label={label}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="inline-block max-w-full align-middle focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={() => setOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setOpen(true)
                    }
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    {...rest}
                    src={displaySrc}
                    alt={alt ?? ""}
                    title={title}
                    className={cn(
                        "cursor-zoom-in transition-opacity hover:opacity-95",
                        className,
                    )}
                    loading="lazy"
                    decoding="async"
                />
            </span>
            {layer ? createPortal(layer, document.body) : null}
        </>
    )
}
