"use client"

import * as React from "react"
import { ArrowRight, ChevronDown } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { formatDate } from "@/lib/forma-date"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Item, ItemContent, ItemFooter, ItemDescription } from "@/components/ui/item"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type RecentPostItem = {
    slug: string
    title: string
    date: string
    wordCount: number
    summary?: string | null
}

/** 首屏与每次「查看更多」追加的条数，避免一次渲染过多导致卡顿 */
const PAGE_SIZE = 20

export function RecentPostsExpandable({ posts }: { posts: RecentPostItem[] }) {
    const [visibleCount, setVisibleCount] = React.useState(() =>
        Math.min(PAGE_SIZE, posts.length),
    )
    const reduceMotion = useReducedMotion()

    const list = posts.slice(0, visibleCount)
    const hasMore = visibleCount < posts.length

    const loadMore = () => {
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, posts.length))
    }

    return (
        <div className="flex w-full min-w-0 flex-col gap-4">
            <div className="relative w-full min-w-0">
                <div
                    role="list"
                    className="grid w-full min-w-0 grid-cols-1 gap-4 max-lg:grid-cols-2 max-lg:gap-3 sm:max-lg:gap-4"
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

                                            <ItemFooter className="min-w-0 w-full max-w-full shrink-0 border-0 px-3 pb-3.5 pt-0 lg:px-6 lg:pb-6">
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
                                            </ItemFooter>
                                        </Link>
                                    </Item>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {hasMore ? (
                    <div
                        className={cn(
                            "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 sm:h-32",
                            "bg-linear-to-t from-background via-background/75 to-transparent",
                            "backdrop-blur-[2px]",
                        )}
                        aria-hidden
                    />
                ) : null}
            </div>

            {hasMore ? (
                <div className="relative z-20 -mt-12 flex justify-center px-2 pb-1 pt-8 sm:-mt-14 sm:pt-10">
                    <Button
                        type="button"
                        variant="default"
                        size="lg"
                        onClick={loadMore}
                        className="shadow-md"
                        aria-label={`再加载 ${Math.min(PAGE_SIZE, posts.length - visibleCount)} 篇文章`}
                    >
                        <ChevronDown data-icon="inline-start" aria-hidden />
                        查看更多
                    </Button>
                </div>
            ) : null}
        </div>
    )
}
