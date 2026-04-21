"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { formatDotMonthDay } from "@/lib/forma-date"
import { cn } from "@/lib/utils"

export type ArchivePostItem = {
  slug: string
  title: string
  date: string
  tags: string[]
  /** frontmatter summary，无则卡片摘要行可退化为标签 */
  summary?: string | null
}

const easeOut = [0.25, 0.46, 0.45, 0.94] as const

/** 首屏最多渲染条数，减轻上百篇时的 DOM / 布局压力；其余通过「查看更多」追加 */
const PAGE_SIZE = 50

function groupByYear(posts: ArchivePostItem[]) {
  const groups: { year: string; items: ArchivePostItem[] }[] = []
  for (const post of posts) {
    const year =
      post.date.slice(0, 4) || String(new Date(post.date).getFullYear())
    const last = groups[groups.length - 1]
    if (!last || last.year !== year) {
      groups.push({ year, items: [post] })
    } else {
      last.items.push(post)
    }
  }
  return groups
}

function excerptLine(post: ArchivePostItem): string | null {
  const s = post.summary?.trim()
  if (s) return `· ${s}`
  if (post.tags.length > 0) return `· ${post.tags.join("、")}`
  return null
}

export function ArchiveListExpandable({ posts }: { posts: ArchivePostItem[] }) {
  const reduceMotion = useReducedMotion()
  const [visibleCount, setVisibleCount] = React.useState(() =>
    Math.min(PAGE_SIZE, posts.length),
  )

  React.useEffect(() => {
    setVisibleCount(Math.min(PAGE_SIZE, posts.length))
  }, [posts.length])

  const visiblePosts = posts.slice(0, visibleCount)
  const groups = groupByYear(visiblePosts)
  const hasMore = visibleCount < posts.length

  const loadMore = () => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, posts.length))
  }

  return (
    <div className="flex flex-col">
      {groups.map((group, groupIndex) => (
        <motion.section
          key={`${group.year}-${groupIndex}`}
          className={cn("relative", groupIndex > 0 && "mt-14 sm:mt-16")}
          aria-labelledby={`archive-year-heading-${group.year}-${groupIndex}`}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 0.45,
                  delay: Math.min(groupIndex * 0.06, 0.25),
                  ease: easeOut,
                }
          }
        >
          <h2
            id={`archive-year-heading-${group.year}-${groupIndex}`}
            className="mb-5 flex flex-wrap items-baseline gap-x-1 text-balance sm:mb-6"
          >
            <span className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {group.year}
            </span>
            <span className="text-xs font-normal tabular-nums text-muted-foreground sm:text-sm">
              （共 {group.items.length} 篇）
            </span>
          </h2>

          <div className="flex flex-col gap-4 sm:gap-5">
            {group.items.map((blog, itemIndex) => {
              const stagger = groupIndex * 0.05 + itemIndex * 0.04
              const excerpt = excerptLine(blog)
              return (
                <motion.article
                  key={blog.slug}
                  className="min-w-0 overflow-hidden rounded-lg"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.38,
                          delay: Math.min(stagger, 0.4),
                          ease: easeOut,
                        }
                  }
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -4,
                          transition: {
                            type: "spring",
                            stiffness: 420,
                            damping: 28,
                          },
                        }
                  }
                >
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="relative block h-full min-w-0 overflow-hidden border-0 bg-muted/50 px-4 py-5 shadow-lg ring-0 transition-[box-shadow,background-color] duration-300 hover:bg-muted/40 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-muted/40 dark:hover:bg-muted/35 sm:px-5 sm:py-5"
                  >
                    <div className="min-w-0">
                      <time
                        dateTime={blog.date}
                        className="mb-2 block w-full text-right text-xs tabular-nums text-muted-foreground sm:mb-2.5 sm:text-sm"
                      >
                        {formatDotMonthDay(blog.date)}
                      </time>
                      <h3 className="text-left text-base font-semibold leading-snug text-foreground">
                        {blog.title}
                      </h3>
                      {excerpt ? (
                        <p className="mt-2 line-clamp-1 text-left text-sm leading-relaxed text-muted-foreground">
                          {excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </motion.article>
              )
            })}
          </div>
        </motion.section>
      ))}

      {hasMore ? (
        <div className="mt-10 flex justify-center sm:mt-12">
          <Button
            type="button"
            variant="default"
            size="lg"
            onClick={loadMore}
            className="shadow-md"
            aria-label={`再加载 ${Math.min(PAGE_SIZE, posts.length - visibleCount)} 篇文章`}
          >
            <ChevronDown data-icon="inline-start" className="size-5" aria-hidden />
            查看更多
          </Button>
        </div>
      ) : null}
    </div>
  )
}
