"use client"

import * as React from "react"
import type { TocItem } from "@/lib/extract-toc"
import { formatTocLabel } from "@/lib/extract-toc"
import { cn } from "@/lib/utils"

/** 与 `blog-article-prose` 里 `prose-headings:scroll-mt-24` / 顶栏 sticky 对齐 */
const SCROLL_ACTIVE_OFFSET_PX = 96

type Props = {
    items: TocItem[]
    className?: string
    /** 点击目录项后回调（如关闭移动端抽屉） */
    onItemNavigate?: () => void
}

function useActiveTocId(ids: string[]) {
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

/** 无边框目录：随正文滚动高亮当前章节对应条目 */
export function ArticleToc({ items, className, onItemNavigate }: Props) {
    const ids = React.useMemo(() => items.map((i) => i.id), [items])
    const activeId = useActiveTocId(ids)

    if (items.length === 0) {
        return (
            <p className={cn("text-xs text-muted-foreground/90", className)}>暂无目录</p>
        )
    }

    const minDepth = Math.min(...items.map((i) => i.depth))

    const list = (
        <ul className="space-y-0.5 text-[0.85rem] leading-snug">
            {items.map((item, index) => {
                const indent = Math.max(0, item.depth - minDepth)
                const isActive = activeId === item.id
                return (
                    <li key={`${item.id}-${index}`}>
                        <a
                            href={`#${item.id}`}
                            style={{ paddingLeft: `${indent * 0.75}rem` }}
                            aria-current={isActive ? "location" : undefined}
                            onClick={(e) => {
                                if (!onItemNavigate) return
                                // 移动端抽屉内：原生 # 跳转易被 Vaul/Radix 与关抽屉时序打断，改为手动滚动并更新 hash
                                e.preventDefault()
                                const id = item.id
                                onItemNavigate()
                                // 略晚于关抽屉，避免 Vaul 锁滚动/焦点层仍拦截导致 scrollIntoView 无效（尤其移动端）
                                window.setTimeout(() => {
                                    const el = document.getElementById(id)
                                    if (el) {
                                        el.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        })
                                    }
                                    const { pathname, search } = window.location
                                    window.history.replaceState(
                                        null,
                                        "",
                                        `${pathname}${search}#${id}`,
                                    )
                                }, 120)
                            }}
                            className={cn(
                                "block rounded-lg py-1.5 transition-colors",
                                isActive
                                    ? "bg-muted/50 font-medium text-foreground"
                                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                            )}
                        >
                            <span className="line-clamp-3">{formatTocLabel(item.text)}</span>
                        </a>
                    </li>
                )
            })}
        </ul>
    )

    return (
        <nav aria-label="文章目录" className={cn(className)}>
            <div className="pr-2">{list}</div>
        </nav>
    )
}
