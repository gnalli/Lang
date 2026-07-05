"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { formatDotMonthDay } from "@/lib/format-date"
import { PostListInlineSummary } from "@/components/blog/post-list-inline-summary"
import { cn } from "@/lib/utils"

export type ArchivePostItem = {
  slug: string
  title: string
  date: string
  summary?: string | null
}

const easeOut = [0.25, 0.46, 0.45, 0.94] as const

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

function ArchivePostRow({
  post,
  active,
  onActivate,
}: {
  post: ArchivePostItem
  active: boolean
  onActivate: () => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <li className="border-b border-foreground/15 last:border-b-0">
      <Link
        href={`/blog/${post.slug}`}
        onMouseEnter={onActivate}
        onFocus={onActivate}
        className={cn(
          "group/row grid grid-cols-[3.25rem_1fr] gap-x-4 no-underline transition-colors duration-300 sm:grid-cols-[3.5rem_1fr] sm:gap-x-6",
          active
            ? "bg-primary px-4 py-6 text-primary-foreground sm:px-5 sm:py-7"
            : "py-6 text-foreground sm:py-7",
        )}
      >
        <time
          dateTime={post.date}
          className={cn(
            "pt-0.5 text-sm tabular-nums",
            active ? "text-primary-foreground/85" : "text-muted-foreground",
          )}
        >
          {formatDotMonthDay(post.date)}
        </time>

        <div className="min-w-0">
          <h3
            className={cn(
              "text-pretty font-semibold leading-snug transition-colors",
              active
                ? "text-lg text-primary-foreground sm:text-xl"
                : "text-base text-foreground sm:text-lg",
            )}
          >
            {post.title}
          </h3>
          <PostListInlineSummary
            summary={post.summary}
            active={active}
            reduceMotion={reduceMotion}
          />
        </div>
      </Link>
    </li>
  )
}

export function ArchiveListExpandable({ posts }: { posts: ArchivePostItem[] }) {
  const reduceMotion = useReducedMotion()
  const [visibleCount, setVisibleCount] = React.useState(() =>
    Math.min(PAGE_SIZE, posts.length),
  )
  const [activeSlug, setActiveSlug] = React.useState<string | null>(null)

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
    <div className="flex flex-col" onMouseLeave={() => setActiveSlug(null)}>
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
            className="mb-5 flex flex-wrap items-baseline justify-center gap-x-1 text-balance text-center sm:mb-6"
          >
            <span className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {group.year}
            </span>
            <span className="text-xs font-normal tabular-nums text-muted-foreground sm:text-sm">
              （共 {group.items.length} 篇）
            </span>
          </h2>

          <ul role="list">
            {group.items.map((blog) => (
              <ArchivePostRow
                key={blog.slug}
                post={blog}
                active={activeSlug === blog.slug}
                onActivate={() => setActiveSlug(blog.slug)}
              />
            ))}
          </ul>
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
