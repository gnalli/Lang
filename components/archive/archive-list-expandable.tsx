"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { Bookmark, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatMonthDayOnly } from "@/lib/forma-date"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type ArchivePostItem = {
  slug: string
  title: string
  date: string
  wordCount: number
}

const PAGE_SIZE = 15

const easeOut = [0.25, 0.46, 0.45, 0.94] as const

function groupByYear(posts: ArchivePostItem[]) {
  const groups: { year: string; items: ArchivePostItem[] }[] = []
  for (const post of posts) {
    const year = post.date.slice(0, 4) || String(new Date(post.date).getFullYear())
    const last = groups[groups.length - 1]
    if (!last || last.year !== year) {
      groups.push({ year, items: [post] })
    } else {
      last.items.push(post)
    }
  }
  return groups
}

export function ArchiveListExpandable({ posts }: { posts: ArchivePostItem[] }) {
  const [visibleCount, setVisibleCount] = React.useState(() =>
    Math.min(PAGE_SIZE, posts.length),
  )
  const reduceMotion = useReducedMotion()

  const visible = posts.slice(0, visibleCount)
  const groups = groupByYear(visible)
  const hasMore = visibleCount < posts.length

  const loadMore = () => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, posts.length))
  }

  return (
    <div>
      <div className="relative">
        <div className="flex flex-col">
          {groups.map((group, groupIndex) => (
            <motion.section
              key={`${group.year}-${groupIndex}`}
              className={cn(
                groupIndex > 0 &&
                  "pt-8 sm:mt-8",
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.48,
                      delay: Math.min(groupIndex * 0.07, 0.35),
                      ease: easeOut,
                    }
              }
            >
              <motion.h2
                className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-[2rem]"
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.4,
                        delay: Math.min(groupIndex * 0.07 + 0.04, 0.4),
                        ease: easeOut,
                      }
                }
              >
                {group.year}
              </motion.h2>
              <ul className="mt-6 grid list-none grid-cols-1 gap-3 p-0 sm:mt-8 md:grid-cols-2 md:gap-4">
                {group.items.map((blog) => {
                  const index = visible.findIndex((p) => p.slug === blog.slug)
                  return (
                    <motion.li
                      key={blog.slug}
                      className="min-w-0 list-none h-full"
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              duration: 0.45,
                              delay: Math.min(index * 0.045, 0.55),
                              ease: easeOut,
                            }
                      }
                      whileHover={
                        reduceMotion
                          ? undefined
                          : {
                              y: -3,
                              transition: {
                                type: "spring",
                                stiffness: 420,
                                damping: 28,
                              },
                            }
                      }
                    >
                      <Card
                        className={cn(
                          "h-full gap-0 py-0",
                          "rounded-xl border-0 bg-muted/50 shadow-none",
                          "ring-1 ring-border/60 dark:bg-muted/35 dark:ring-border/50",
                        )}
                      >
                        <CardContent className="flex h-full flex-col p-4 sm:p-4">
                          <Link
                            href={`/blog/${blog.slug}`}
                            className="flex h-full min-h-0 flex-col no-underline outline-none transition-opacity hover:opacity-90 focus-visible:opacity-90"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="line-clamp-2 min-w-0 flex-1 text-left text-sm font-medium leading-snug text-foreground sm:text-[0.9375rem]">
                                    {blog.title}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-sm bg-primary">
                                  <p>{blog.title}</p>
                                </TooltipContent>
                              </Tooltip>
                              <Bookmark
                                className="size-4 shrink-0 stroke-[1.65] text-muted-foreground"
                                aria-hidden
                              />
                            </div>
                            <div className="mt-auto pt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground sm:text-sm">
                              <time dateTime={blog.date} className="tabular-nums">
                                {formatMonthDayOnly(blog.date)}
                              </time>
                              <span className="shrink-0 tabular-nums">
                                {blog.wordCount > 0 ? `${blog.wordCount} 字` : "—"}
                              </span>
                            </div>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.li>
                  )
                })}
              </ul>
            </motion.section>
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
        <motion.div
          className="relative z-20 -mt-12 flex justify-center px-2 pb-1 pt-8 sm:-mt-14 sm:pt-10"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.4, ease: easeOut }
          }
        >
          <Button
            type="button"
            variant="default"
            size="lg"
            onClick={loadMore}
            className={cn(
              "shadow-md",
              "h-9 min-h-9 gap-2 rounded-lg px-5 text-sm font-medium sm:h-10 sm:min-h-10 sm:px-6 sm:text-base",
            )}
            aria-label={`再加载 ${Math.min(PAGE_SIZE, posts.length - visibleCount)} 篇文章`}
          >
            <ChevronDown data-icon="inline-start" className="size-5" aria-hidden />
            查看更多
          </Button>
        </motion.div>
      ) : null}
    </div>
  )
}
