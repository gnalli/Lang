"use client"

import * as React from "react"
import { TextAlignStart } from "lucide-react"
import type { TocItem } from "@/lib/extract-toc"
import {
    formatTocLabel,
    getTocTopLevelIndex,
    getVisibleTocIndices,
    tocSectionHasChildren,
} from "@/lib/extract-toc"
import { cn } from "@/lib/utils"
import { useActiveTocId } from "@/components/blog/article-toc"

export const ARTICLE_TOC_LINE_BASE_PX = 8

const LINE_BASE = ARTICLE_TOC_LINE_BASE_PX

/** 左侧竖线 x 偏移（相对容器） */
function getLineOffset(depth: number, minDepth: number) {
    const level = depth - minDepth
    if (level <= 0) return LINE_BASE
    if (level === 1) return LINE_BASE + 8
    return LINE_BASE + 16
}

/** 链接文字左内边距 */
function getItemPadding(depth: number, minDepth: number) {
    const level = depth - minDepth
    if (level <= 0) return LINE_BASE + 12
    if (level === 1) return LINE_BASE + 24
    return LINE_BASE + 36
}

export function getActiveTocRange(items: TocItem[], activeIndex: number, minDepth: number) {
    if (items.length === 0 || activeIndex < 0) {
        return { start: 0, end: 0 }
    }

    let start = activeIndex
    for (let i = activeIndex - 1; i >= 0; i--) {
        if (items[i]!.depth === minDepth && i !== activeIndex) break
        start = i
    }

    return { start, end: activeIndex }
}

function measureLinkBounds(link: HTMLElement) {
    const styles = getComputedStyle(link)
    const top = link.offsetTop + Number.parseFloat(styles.paddingTop)
    const bottom =
        link.offsetTop + link.clientHeight - Number.parseFloat(styles.paddingBottom)
    return { top, bottom, height: Math.max(0, bottom - top) }
}

function buildTrackPath(
    container: HTMLElement,
    items: TocItem[],
    minDepth: number,
) {
    let d = ""
    let w = 0
    let h = 0
    let upperBottom = 0
    let upperX = 0

    for (let i = 0; i < items.length; i++) {
        const item = items[i]!
        const element = container.querySelector<HTMLElement>(`[data-toc-index="${i}"]`)
        if (!element) continue

        const { top, bottom } = measureLinkBounds(element)
        const x = getLineOffset(item.depth, minDepth) + 0.5

        w = Math.max(x + 8, w)
        h = Math.max(h, bottom)

        if (i === 0) {
            d += ` M${x} ${top} L${x} ${bottom}`
        } else {
            d += ` C ${upperX} ${top - 4} ${x} ${upperBottom + 4} ${x} ${top} L${x} ${bottom}`
        }

        upperX = x
        upperBottom = bottom
    }

    if (!d) return null
    return { d, width: w, height: h }
}

function TocActiveIndicator({
    containerRef,
    track,
    range,
    items,
    minDepth,
}: {
    containerRef: React.RefObject<HTMLElement | null>
    track: { d: string; width: number; height: number }
    range: { start: number; end: number }
    items: TocItem[]
    minDepth: number
}) {
    const maskRef = React.useRef<HTMLDivElement>(null)
    const innerSvgRef = React.useRef<SVGSVGElement>(null)
    const dotRef = React.useRef<HTMLDivElement>(null)
    const rangeRef = React.useRef(range)
    const thumbMetaRef = React.useRef<{ start: number; end: number; isUp: boolean } | null>(
        null,
    )

    const applyThumb = React.useCallback(() => {
        const container = containerRef.current
        const mask = maskRef.current
        const innerSvg = innerSvgRef.current
        const dot = dotRef.current
        if (!container || !mask || !innerSvg || !dot) return

        const { start, end } = rangeRef.current
        const startLink = container.querySelector<HTMLElement>(`[data-toc-index="${start}"]`)
        const endLink = container.querySelector<HTMLElement>(`[data-toc-index="${end}"]`)
        if (!startLink || !endLink) return

        const prev = thumbMetaRef.current
        let isUp = false
        if (prev) {
            isUp =
                prev.start > start ||
                prev.end > end ||
                (prev.start === start && prev.end === end && prev.isUp)
        }
        thumbMetaRef.current = { start, end, isUp }

        const startBounds = measureLinkBounds(startLink)
        const endBounds = measureLinkBounds(endLink)
        const top = startBounds.top
        const height = Math.max(0, endBounds.bottom - top)

        const anchorItem = items[isUp ? start : end]
        const dotX = anchorItem ? getLineOffset(anchorItem.depth, minDepth) + 0.5 : LINE_BASE
        const dotY = isUp ? top : top + height

        mask.style.top = `${top}px`
        mask.style.height = `${Math.max(height, 1)}px`
        innerSvg.style.transform = `translateY(${-top}px)`
        dot.style.left = `${dotX}px`
        dot.style.top = `${dotY}px`
    }, [containerRef, items, minDepth])

    React.useLayoutEffect(() => {
        rangeRef.current = range
        applyThumb()

        const container = containerRef.current
        if (!container) return

        const observer = new ResizeObserver(() => applyThumb())
        observer.observe(container)
        window.addEventListener("resize", applyThumb)

        return () => {
            observer.disconnect()
            window.removeEventListener("resize", applyThumb)
        }
    }, [applyThumb, containerRef, track.d, range])

    React.useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const anchorIndex = thumbMetaRef.current?.isUp ? range.start : range.end
        const activeLink = container.querySelector<HTMLElement>(
            `[data-toc-index="${anchorIndex}"]`,
        )
        if (!activeLink) return

        const linkTop = activeLink.offsetTop
        const linkBottom = linkTop + activeLink.offsetHeight
        const viewTop = container.scrollTop
        const viewBottom = viewTop + container.clientHeight

        if (linkTop < viewTop) {
            container.scrollTop = linkTop
        } else if (linkBottom > viewBottom) {
            container.scrollTop = linkBottom - container.clientHeight
        }
    }, [containerRef, range.start, range.end])

    return (
        <>
            <svg
                aria-hidden
                width={track.width}
                height={track.height}
                className="pointer-events-none absolute left-0 top-0 overflow-visible"
            >
                <path d={track.d} stroke="var(--border)" strokeWidth={1} fill="none" />
            </svg>

            <div
                ref={maskRef}
                className="pointer-events-none absolute left-0 overflow-hidden motion-safe:transition-[top,height] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ width: track.width }}
            >
                <svg
                    ref={innerSvgRef}
                    aria-hidden
                    width={track.width}
                    height={track.height}
                    className="absolute left-0 top-0 overflow-visible motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
                >
                    <path d={track.d} stroke="var(--primary)" strokeWidth={1} fill="none" />
                </svg>
            </div>

            <div
                ref={dotRef}
                aria-hidden
                className="pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary motion-safe:transition-[top,left] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
        </>
    )
}

type FumadocsTocProps = {
    items: TocItem[]
    className?: string
    showHeader?: boolean
    onItemNavigate?: () => void
    /** auto：仅随滚动展开当前一级下的子标题；always：始终展示全部 */
    subItemsVisibility?: "auto" | "always"
}

export function ArticleTocFumadocs({
    items,
    className,
    showHeader = false,
    onItemNavigate,
    subItemsVisibility = "auto",
}: FumadocsTocProps) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const ids = React.useMemo(() => items.map((i) => i.id), [items])
    const activeId = useActiveTocId(ids)
    const [track, setTrack] = React.useState<{
        d: string
        width: number
        height: number
    } | null>(null)

    const minDepth = items.length > 0 ? Math.min(...items.map((i) => i.depth)) : 2
    const activeIndex =
        items.length > 0
            ? Math.max(0, items.findIndex((item) => item.id === activeId))
            : 0

    const visibleIndices = React.useMemo(() => {
        if (subItemsVisibility === "always") {
            return items.map((_, index) => index)
        }
        return getVisibleTocIndices(items, activeIndex, minDepth)
    }, [items, activeIndex, minDepth, subItemsVisibility])

    const visibleActiveIndex = React.useMemo(() => {
        const index = visibleIndices.indexOf(activeIndex)
        return index >= 0 ? index : Math.max(0, visibleIndices.length - 1)
    }, [visibleIndices, activeIndex])

    const visibleItems = React.useMemo(
        () => visibleIndices.map((index) => items[index]!),
        [items, visibleIndices],
    )

    const range = getActiveTocRange(visibleItems, visibleActiveIndex, minDepth)

    React.useLayoutEffect(() => {
        const container = containerRef.current
        if (!container || visibleItems.length === 0) {
            setTrack(null)
            return
        }

        const measure = () => {
            setTrack(buildTrackPath(container, visibleItems, minDepth))
        }

        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(container)
        window.addEventListener("resize", measure)

        return () => {
            observer.disconnect()
            window.removeEventListener("resize", measure)
        }
    }, [visibleItems, minDepth])

    if (items.length === 0) {
        return (
            <p className={cn("text-xs text-muted-foreground/90", className)}>暂无目录</p>
        )
    }

    return (
        <nav aria-label="文章目录" className={cn(className)}>
            {showHeader ? (
                <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <TextAlignStart className="size-4 shrink-0" aria-hidden />
                    本页目录
                </p>
            ) : null}

            <div
                ref={containerRef}
                className="toc-scroll relative max-h-[min(40rem,calc(100dvh-7rem))] overflow-y-auto scroll-smooth"
            >
                {track ? (
                    <TocActiveIndicator
                        containerRef={containerRef}
                        track={track}
                        range={range}
                        items={visibleItems}
                        minDepth={minDepth}
                    />
                ) : null}

                <ul className="relative space-y-0">
                    {visibleIndices.map((originalIndex, visibleIndex) => {
                        const item = items[originalIndex]!
                        const isActive =
                            visibleIndex >= range.start && visibleIndex <= range.end
                        const label = formatTocLabel(item.text)
                        const lineX = getLineOffset(item.depth, minDepth)
                        const paddingLeft = getItemPadding(item.depth, minDepth)
                        const prevOriginal =
                            visibleIndex > 0 ? visibleIndices[visibleIndex - 1]! : null
                        const nextOriginal =
                            visibleIndex < visibleIndices.length - 1
                                ? visibleIndices[visibleIndex + 1]!
                                : null
                        const prev = prevOriginal !== null ? items[prevOriginal]! : null
                        const next = nextOriginal !== null ? items[nextOriginal]! : null
                        const upperOffset = prev
                            ? getLineOffset(prev.depth, minDepth)
                            : lineX
                        const lowerOffset = next
                            ? getLineOffset(next.depth, minDepth)
                            : lineX
                        const isExpandedSection =
                            subItemsVisibility === "auto" &&
                            item.depth === minDepth &&
                            getTocTopLevelIndex(items, activeIndex, minDepth) ===
                                originalIndex &&
                            tocSectionHasChildren(items, originalIndex, minDepth)

                        return (
                            <li key={`${item.id}-${originalIndex}`}>
                                <a
                                    href={`#${item.id}`}
                                    data-toc-index={visibleIndex}
                                    data-active={isActive ? "true" : "false"}
                                    aria-current={
                                        activeId === item.id ? "location" : undefined
                                    }
                                    aria-expanded={
                                        isExpandedSection ? true : undefined
                                    }
                                    style={{ paddingInlineStart: `${paddingLeft}px` }}
                                    onClick={(e) => {
                                        if (!onItemNavigate) return
                                        e.preventDefault()
                                        const id = item.id
                                        onItemNavigate()
                                        window.setTimeout(() => {
                                            document.getElementById(id)?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            })
                                            const { pathname, search } = window.location
                                            window.history.replaceState(
                                                null,
                                                "",
                                                `${pathname}${search}#${id}`,
                                            )
                                        }, 120)
                                    }}
                                    className={cn(
                                        "relative block py-1.5 text-sm leading-snug",
                                        "transition-colors duration-200 ease-out",
                                        "text-muted-foreground hover:text-foreground",
                                        "data-[active=true]:text-primary",
                                        visibleIndex === 0 && "pt-0",
                                        visibleIndex === visibleIndices.length - 1 && "pb-0",
                                    )}
                                >
                                    {visibleIndex > 0 && upperOffset !== lineX ? (
                                        <svg
                                            aria-hidden
                                            viewBox={`${Math.min(lineX, upperOffset)} 0 ${Math.abs(upperOffset - lineX) + 1} 12`}
                                            className="pointer-events-none absolute -top-1.5 -z-1"
                                            style={{
                                                width: Math.abs(upperOffset - lineX) + 1,
                                                height: 12,
                                                insetInlineStart: Math.min(lineX, upperOffset),
                                            }}
                                        >
                                            <path
                                                d={`M${upperOffset > lineX ? Math.abs(upperOffset - lineX) : 0} 0 L${upperOffset > lineX ? 0 : Math.abs(upperOffset - lineX)} 12`}
                                                stroke="var(--border)"
                                                strokeWidth={1}
                                                fill="none"
                                            />
                                        </svg>
                                    ) : null}
                                    <span
                                        aria-hidden
                                        className={cn(
                                            "absolute inset-y-0 -z-1 w-px bg-border/80",
                                            upperOffset !== lineX && "top-1.5",
                                            lowerOffset !== lineX && "bottom-1.5",
                                        )}
                                        style={{ insetInlineStart: lineX }}
                                    />
                                    <span className="line-clamp-3">{label}</span>
                                </a>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </nav>
    )
}
