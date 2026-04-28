"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { formatDate } from "@/lib/forma-date"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Item, ItemContent, ItemDescription } from "@/components/ui/item"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type RecentPostItem = {
    slug: string
    title: string
    date: string
    wordCount: number
    summary?: string | null
}

/** 首页博文分页：每页展示 20 篇 */
const PAGE_SIZE = 20

function getVisiblePages(currentPage: number, totalPages: number) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, "...", totalPages] as const
    }

    if (currentPage >= totalPages - 3) {
        return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages] as const
}

export function RecentPostsExpandable({ posts }: { posts: RecentPostItem[] }) {
    const [currentPage, setCurrentPage] = React.useState(1)
    const reduceMotion = useReducedMotion()

    const totalPages = Math.ceil(posts.length / PAGE_SIZE)
    const list = posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    const visiblePages = getVisiblePages(currentPage, totalPages)

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="flex w-full min-w-0 flex-col gap-4">
            <div className="relative w-full min-w-0">
                <div
                    role="list"
                    className="grid w-full min-w-0 grid-cols-1 gap-3 sm:gap-4 sm:max-lg:grid-cols-2"
                >
                    {list.map((blog, index) => (
                        <motion.div
                            key={blog.slug}
                            role="listitem"
                            className="min-w-0 w-full max-w-full overflow-hidden rounded-lg"
                            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={
                                reduceMotion
                                    ? { duration: 0 }
                                    : {
                                        duration: 0.45,
                                        delay: Math.min(index * 0.05, 0.4),
                                        ease: [0.25, 0.46, 0.45, 0.94],
                                    }
                            }
                            whileHover={
                                reduceMotion
                                    ? undefined
                                    : {
                                        y: -4,
                                        transition: { type: "spring", stiffness: 420, damping: 28 },
                                    }
                            }
                        >
                            <Card className="h-full min-w-0 bg-muted/50 dark:bg-muted/40 max-w-full gap-0 overflow-hidden border-0 py-0 shadow-lg ring-0 transition-shadow duration-300 hover:shadow-xl">
                                <CardContent className="p-0">
                                    <Item
                                        variant="default"
                                        size="default"
                                        className={cn(
                                            "min-w-0 rounded-none border-0 py-0 shadow-none ring-0",
                                            "hover:bg-muted/40",
                                        )}
                                        asChild
                                    >
                                        <Link
                                            href={`/blog/${blog.slug}`}
                                            className="flex min-w-0 w-full max-w-full flex-col items-stretch! gap-0 overflow-hidden no-underline hover:no-underline"
                                        >
                                            <ItemContent className="min-w-0 w-full max-w-full shrink-0 overflow-hidden gap-0 px-3 py-3.5 lg:px-6 lg:py-6">
                                                <div className="flex min-w-0 max-w-full flex-col gap-1.5 lg:flex-row lg:items-start lg:gap-4">
                                                    <div className="min-w-0 max-w-full flex-1 overflow-hidden">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <p
                                                                    className={cn(
                                                                        "m-0 block min-w-0 max-w-full cursor-default text-left font-heading text-sm font-semibold leading-snug text-foreground",
                                                                        "max-lg:line-clamp-2 max-lg:wrap-break-word max-lg:overflow-hidden lg:truncate lg:text-lg",
                                                                    )}
                                                                >
                                                                    {blog.title}
                                                                </p>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="left"
                                                                className="max-w-sm"
                                                            >
                                                                <p>{blog.title}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <time
                                                        className="shrink-0 text-[0.65rem] leading-snug tabular-nums text-muted-foreground max-lg:max-w-full max-lg:wrap-break-word lg:pt-0.5 lg:text-xs xl:text-sm"
                                                        dateTime={blog.date}
                                                    >
                                                        {formatDate(blog.date)} · {blog.wordCount} 字
                                                    </time>
                                                </div>
                                                {blog.summary ? (
                                                    <ItemDescription
                                                        className={cn(
                                                            "mt-2 block min-w-0 max-w-full overflow-hidden wrap-break-word text-left text-xs leading-relaxed lg:mt-4 lg:text-sm lg:text-[0.9375rem]",
                                                            "line-clamp-1",
                                                        )}
                                                    >
                                                        {blog.summary}
                                                    </ItemDescription>
                                                ) : null}
                                            </ItemContent>

                                            {/* <ItemFooter className="min-w-0 w-full max-w-full shrink-0 border-0 px-3 pb-3.5 pt-0 lg:px-6 lg:pb-6">
                                                <span
                                                    className={cn(
                                                        "flex min-w-0 items-center gap-1 text-xs font-medium lg:gap-1.5 lg:text-sm",
                                                        "text-muted-foreground transition-colors",
                                                        "group-hover/item:text-primary",
                                                    )}
                                                >
                                                    阅读更多
                                                    <ArrowRight
                                                        data-icon="inline-end"
                                                        className="size-3.5 shrink-0 transition-transform group-hover/item:translate-x-0.5 lg:size-4"
                                                        aria-hidden
                                                    />
                                                </span>
                                            </ItemFooter> */}
                                        </Link>
                                    </Item>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {totalPages > 1 ? (
                <nav
                    className="mt-2 flex w-full items-center justify-center overflow-x-auto px-2 py-1"
                    aria-label="近期博文分页"
                >
                    <div className="flex min-w-max items-center gap-1.5 text-lg text-muted-foreground sm:gap-2 sm:text-xl">
                        {visiblePages.map((page, index) =>
                            page === "..." ? (
                                <span key={`ellipsis-${index}`} className="px-1 select-none" aria-hidden>
                                    ...
                                </span>
                            ) : (
                                <Button
                                    key={page}
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => goToPage(page)}
                                    aria-label={`跳转到第 ${page} 页`}
                                    aria-current={page === currentPage ? "page" : undefined}
                                    className={cn(
                                        "h-10 w-10 rounded-full text-base sm:h-11 sm:w-11 sm:text-lg",
                                        page === currentPage
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    {page}
                                </Button>
                            ),
                        )}

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="下一页"
                            className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground sm:h-11 sm:w-11"
                        >
                            <ChevronRight className="size-6" aria-hidden />
                        </Button>
                    </div>
                </nav>
            ) : null}
        </div>
    )
}
