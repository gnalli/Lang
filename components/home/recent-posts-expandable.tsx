"use client"

import * as React from "react"
import { ArrowRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/forma-date"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type RecentPostItem = {
    slug: string
    title: string
    date: string
    wordCount: number
    summary?: string | null
}

/** 首屏与每次「查看更多」追加的条数，避免一次渲染过多导致卡顿 */
const PAGE_SIZE = 10

export function RecentPostsExpandable({ posts }: { posts: RecentPostItem[] }) {
    const [visibleCount, setVisibleCount] = React.useState(() =>
        Math.min(PAGE_SIZE, posts.length),
    )

    const list = posts.slice(0, visibleCount)
    const hasMore = visibleCount < posts.length

    const loadMore = () => {
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, posts.length))
    }

    return (
        <div>
            <div className="relative">
                <ul className="flex flex-col divide-y divide-border/80">
                    {list.map((blog) => (
                        <li key={blog.slug} className="min-w-0">
                            <article>
                                <Link
                                    href={`/blog/${blog.slug}`}
                                    className={cn(
                                        "group block rounded-xl px-3 py-7 transition-colors sm:px-4 sm:py-8",
                                        "hover:bg-muted/45",
                                        "no-underline",
                                    )}
                                >
                                    <div className="flex items-start gap-4 sm:gap-6">
                                        {/* <h2
                                            className={cn(
                                                "min-w-0 flex-1 truncate text-lg font-semibold leading-snug text-foreground",
                                                "sm:text-xl",
                                            )}
                                        >
                                            {blog.title}
                                        </h2> */}
                                        <Tooltip >
                                            <TooltipTrigger asChild>
                                                <h2 className={cn(
                                                    "min-w-0 flex-1 truncate text-lg font-semibold leading-snug text-foreground",
                                                    "sm:text-xl",
                                                )}>{blog.title}</h2>
                                            </TooltipTrigger>
                                            <TooltipContent side="left" className="bg-primary">
                                                <p>{blog.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <time
                                            className="shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground sm:text-sm"
                                            dateTime={blog.date}
                                        >
                                            {formatDate(blog.date)} · {blog.wordCount} 字
                                        </time>
                                    </div>

                                    {blog.summary ? (
                                        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-[0.9375rem]">
                                            {blog.summary}
                                        </p>
                                    ) : null}

                                    <div
                                        className={cn(
                                            "mt-4 flex items-center gap-1.5 text-sm font-medium sm:mt-5",
                                            "text-muted-foreground transition-colors",
                                            "group-hover:text-primary",
                                        )}
                                    >
                                        <span>阅读更多</span>
                                        <ArrowRight
                                            className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                                            aria-hidden
                                        />
                                    </div>
                                </Link>
                            </article>
                        </li>
                    ))}
                </ul>

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
                <div className="relative z-20 -mt-14 flex justify-center px-2 pb-1 pt-10 sm:-mt-16 sm:pt-12">
                    <button
                        type="button"
                        onClick={loadMore}
                        className={cn(
                            "flex max-w-full overflow-hidden rounded-xl shadow-lg transition-all",
                            "ring-1 ring-black/15 dark:ring-white/10",
                            "hover:brightness-110 active:scale-[0.99]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        )}
                        aria-label={`再加载 ${Math.min(PAGE_SIZE, posts.length - visibleCount)} 篇文章`}
                    >
                        <span
                            className={cn(
                                "flex shrink-0 items-center justify-center px-3 py-2 sm:px-2",
                                "bg-primary/40 dark:bg-primary/50 text-primary-foreground dark:text-gray-100",
                            )}
                            aria-hidden
                        >
                            <ChevronDown className="size-5 text-white dark:text-zinc-100" strokeWidth={2.25} /> &nbsp;查看更多
                        </span>
                        {/* <span
                            className={cn(
                                "flex min-w-0 flex-1 items-center justify-center px-6 py-3.5 text-sm font-semibold tracking-wide text-white",
                                "bg-[#2C3243] dark:bg-zinc-800 sm:px-10 sm:text-base",
                            )}
                        >
                            查看更多
                        </span> */}
                    </button>
                </div>
            ) : null}
        </div>
    )
}
