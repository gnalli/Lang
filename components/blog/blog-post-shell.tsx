import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** 博文页两栏网格：正文 | 目录（与 Header max-w-6xl 同宽容器内，左对齐） */
export const BLOG_POST_GRID = {
    /** 正文列最大宽度 */
    article: "minmax(0,54rem)",
    /** 目录列宽度 */
    toc: "12.5rem",
    /** lg+ 列模板 */
    template: "minmax(0,54rem) 12.5rem",
    /** 正文与目录列间距 */
    gap: "lg:gap-x-10",
    /** 整体左内边距（略小于原先 1fr 留白，正文稍向左靠） */
    inset: "lg:pl-12",
} as const

type BlogPostShellProps = {
    children: ReactNode
    toc?: ReactNode
    className?: string
}

export function BlogPostShell({ children, toc, className }: BlogPostShellProps) {
    if (!toc) {
        return (
            <article className={cn("mx-auto w-full min-w-0 max-w-[54rem]", className)}>
                {children}
            </article>
        )
    }

    return (
        <div
            className={cn(
                "grid w-full grid-cols-1 gap-y-10",
                "lg:grid-cols-[minmax(0,54rem)_12.5rem]",
                "lg:items-stretch lg:justify-start lg:gap-x-10 lg:pl-12",
                className,
            )}
        >
            <article className="min-w-0">{children}</article>
            <div className="pointer-events-none hidden min-h-0 min-w-0 lg:block">
                {toc}
            </div>
        </div>
    )
}
