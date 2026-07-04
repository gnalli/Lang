"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { TagCount } from "@/lib/blog-tags"
import { parseKeywords } from "@/lib/blog-tags"
import type { TopicPostItem } from "@/lib/blog-sections"
import { formatDateList } from "@/lib/forma-date"
import { PostListInlineSummary } from "@/components/blog/post-list-inline-summary"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 15

function TopicPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="博文列表分页"
      className="mt-10 flex items-center justify-center gap-3 sm:gap-4"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(
          "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm transition-colors touch-manipulation",
          page <= 1
            ? "cursor-not-allowed text-muted-foreground/40"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        上一页
      </button>
      <span className="min-w-18 text-center text-sm tabular-nums text-muted-foreground">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(
          "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm transition-colors touch-manipulation",
          page >= totalPages
            ? "cursor-not-allowed text-muted-foreground/40"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        下一页
      </button>
    </nav>
  )
}

function TopicPostRow({
  post,
  active,
  onActivate,
}: {
  post: TopicPostItem
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
          "group/row relative grid grid-cols-[5.5rem_1fr] gap-x-4 no-underline transition-colors duration-300 sm:grid-cols-[6.5rem_1fr] sm:gap-x-6",
          active
            ? "bg-primary px-4 py-6 text-primary-foreground sm:px-5 sm:py-7"
            : "py-6 text-foreground sm:py-7",
        )}
      >
        <AnimatePresence initial={false}>
          {active ? (
            <motion.span
              key="word-count"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="pointer-events-none absolute top-5 right-4 text-xs tabular-nums text-primary-foreground/80 sm:top-6 sm:right-5 sm:text-sm"
            >
              {post.wordCount.toLocaleString("zh-CN")} 字
            </motion.span>
          ) : null}
        </AnimatePresence>

        <time
          dateTime={post.date}
          className={cn(
            "pt-0.5 text-sm tabular-nums",
            active ? "text-primary-foreground/85" : "text-muted-foreground",
          )}
        >
          {formatDateList(post.date)}
        </time>

        <div className="min-w-0 pr-12 sm:pr-16">
          <h2
            className={cn(
              "text-pretty font-semibold leading-snug transition-colors",
              active
                ? "text-lg text-primary-foreground sm:text-xl"
                : "text-base text-foreground sm:text-lg",
            )}
          >
            {post.title}
          </h2>
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

export function TopicPageContent({
  posts,
  tags,
}: {
  posts: TopicPostItem[]
  tags: TagCount[]
}) {
  const [activeTag, setActiveTag] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  const filtered = React.useMemo(() => {
    if (!activeTag) return posts
    const needle = activeTag.toLowerCase()
    return posts.filter((post) =>
      parseKeywords(post.keywords).some((t) => t.toLowerCase() === needle),
    )
  }, [activeTag, posts])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  React.useEffect(() => {
    setActiveIndex(null)
    setPage(1)
  }, [activeTag])

  React.useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const tagButtonClass = (selected: boolean) =>
    cn(
      "inline-flex items-baseline gap-1.5 text-sm transition-colors sm:text-base",
      selected
        ? "font-medium text-foreground"
        : "text-muted-foreground hover:text-foreground",
    )

  return (
    <div className="text-left">
      <nav
        className="mt-10 flex w-full flex-wrap items-center justify-start gap-x-4 gap-y-3 sm:gap-x-6"
        aria-label="博文分类"
      >
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          className={tagButtonClass(activeTag === null)}
        >
          全部
          <span className="text-xs text-muted-foreground/70 sm:text-sm">
            {posts.length}
          </span>
        </button>
        {tags.map(({ tag, count }) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={tagButtonClass(activeTag?.toLowerCase() === tag.toLowerCase())}
          >
            {tag}
            <span className="text-xs text-muted-foreground/70 sm:text-sm">
              {count}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-14 sm:mt-18">
        <div
          className="grid grid-cols-[5.5rem_1fr] gap-x-4 border-b border-foreground/15 pb-3 text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase sm:grid-cols-[6.5rem_1fr] sm:gap-x-6"
          aria-hidden
        >
          <span>日期</span>
          <span>标题</span>
        </div>

        {pageItems.length > 0 ? (
          <ul role="list" onMouseLeave={() => setActiveIndex(null)}>
            {pageItems.map((post, index) => (
              <TopicPostRow
                key={post.slug}
                post={post}
                active={activeIndex === index}
                onActivate={() => setActiveIndex(index)}
              />
            ))}
          </ul>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">暂无文章</p>
        )}

        <TopicPagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
