"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { formatDateList } from "@/lib/format-date"
import { SITE_HEADER_OFFSET } from "@/lib/site-header-offset"
import { cn } from "@/lib/utils"

export type RecentPostItem = {
  slug: string
  title: string
  date: string
  wordCount: number
  summary?: string | null
  tags?: string[]
}

const DISPLAY_COUNT = 10

const KNOWLEDGE_QUOTE = {
  text: "古者因事设教，教即所记；后世因教设学，学即所传。至于史官记其典章政教、综一代之变，垂诸竹帛，则凡事之所见闻、思之所蓄，皆可寓诸文字，以俟来者之求焉。",
  source: "章学诚，《文史通义》",
}

function PostMeta({ post }: { post: RecentPostItem }) {
  return (
    <motion.div
      key={post.slug}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mt-8 space-y-3"
    >
      {post.tags && post.tags.length > 0 ? (
        <p className="text-sm leading-relaxed text-background/70">
          {post.tags.map((tag, index) => (
            <React.Fragment key={tag}>
              {index > 0 ? (
                <span className="mx-1.5 text-background/45">·</span>
              ) : null}
              <span>{tag}</span>
            </React.Fragment>
          ))}
        </p>
      ) : null}
      <p className="text-sm text-background/70">
        {post.wordCount.toLocaleString("zh-CN")} 字
      </p>
      {post.summary?.trim() ? (
        <p className="hidden text-sm leading-relaxed text-background/70 md:block">
          {post.summary.trim()}
        </p>
      ) : null}
    </motion.div>
  )
}

/** 底边过了成形线才算这一行可以悬停。没有遮罩时（减少动效）整列都可以。 */
function rowPastReveal(row: HTMLElement) {
  const host = row.closest<HTMLElement>("[data-particle-host]")
  if (!host) return true
  const reveal = host.getAttribute("data-particle-reveal")
  if (reveal == null || reveal === "full") return true
  const line = host.getBoundingClientRect().top + Number(reveal)
  return row.getBoundingClientRect().bottom <= line + 0.5
}

function PostRow({
  post,
  index,
  active,
  onActivate,
}: {
  post: RecentPostItem
  index: number
  active: boolean
  onActivate: (row: HTMLElement) => void
}) {
  return (
    <li className="border-b border-background/15 last:border-b-0">
      <Link
        href={`/blog/${post.slug}`}
        data-recent-index={index}
        onMouseEnter={(event) => onActivate(event.currentTarget)}
        onFocus={(event) => onActivate(event.currentTarget)}
        className={cn(
          "group/row grid grid-cols-[4.75rem_1fr] gap-x-3 py-5 no-underline transition-colors duration-300 sm:grid-cols-[6.5rem_1fr] sm:gap-x-6 sm:py-7",
          active ? "bg-recent-row text-foreground" : "text-background",
        )}
      >
        <time
          dateTime={post.date}
          className={cn(
            "pt-0.5 text-sm tabular-nums transition-[translate,color] duration-300 motion-reduce:translate-none motion-reduce:transition-none",
            active ? "translate-x-2 text-foreground/70" : "text-background/70",
          )}
        >
          {formatDateList(post.date)}
        </time>
        <div className="min-w-0">
          <h3
            className={cn(
              "origin-bottom-left text-pretty text-base font-semibold leading-snug transition-[transform,color] duration-300 motion-reduce:transform-none motion-reduce:transition-none sm:text-lg",
              active ? "scale-110 text-foreground" : "text-background",
            )}
          >
            {post.title}
          </h3>
        </div>
      </Link>
    </li>
  )
}

export function HomeRecentPosts({ posts }: { posts: RecentPostItem[] }) {
  const items = posts.slice(0, DISPLAY_COUNT)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const activePost = activeIndex !== null ? items[activeIndex] : null

  const activateRow = React.useCallback((row: HTMLElement) => {
    if (!rowPastReveal(row)) {
      setActiveIndex(null)
      return
    }
    const index = Number(row.dataset.recentIndex)
    if (Number.isNaN(index)) return
    setActiveIndex(index)
  }, [])

  React.useEffect(() => {
    const root = listRef.current
    if (!root) return
    let frame = 0
    const syncHover = () => {
      const links = root.querySelectorAll<HTMLElement>("a[data-recent-index]")
      for (const link of links) {
        const pointing = link.matches(":hover") || link === document.activeElement
        if (pointing && rowPastReveal(link)) {
          activateRow(link)
          return
        }
      }
      setActiveIndex((current) => {
        if (current === null) return null
        const link = root.querySelector<HTMLElement>(`a[data-recent-index="${current}"]`)
        if (!link || !rowPastReveal(link)) return null
        return current
      })
    }
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        syncHover()
      })
    }

    schedule()
    const host = root.closest("[data-particle-host]")
    host?.addEventListener("particlescroll", schedule)
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      host?.removeEventListener("particlescroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [activateRow])

  if (items.length === 0) return null

  return (
    <section
      className="py-8 sm:py-12 md:py-16"
      aria-labelledby="recent-posts-heading"
      onMouseLeave={() => setActiveIndex(null)}
    >
      <div
        className={cn(
          "grid gap-y-8 sm:gap-y-14",
          "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:grid-rows-[auto_1fr] md:items-start md:gap-x-12 md:gap-y-0",
          "lg:gap-x-16 xl:gap-x-20",
        )}
      >
        <h2
          id="recent-posts-heading"
          className={cn(
            "text-balance text-2xl font-semibold tracking-tight text-background sm:text-3xl md:col-start-1 md:row-start-1 md:pr-4",
            SITE_HEADER_OFFSET.anchorScrollMargin,
          )}
        >
          近期文章
        </h2>

        <div
          className="hidden min-w-0 md:col-start-2 md:row-start-1 md:block md:pt-1"
          aria-hidden
        >
          <div className="grid grid-cols-[5.5rem_1fr] gap-x-4 border-b border-background/15 pb-3 text-[0.6875rem] font-medium tracking-[0.14em] text-background/60 uppercase sm:grid-cols-[6.5rem_1fr] sm:gap-x-6">
            <span>日期</span>
            <span>标题</span>
          </div>
        </div>

        <div className="md:col-start-1 md:row-start-2 md:mt-2 md:pr-4 lg:mt-4">
          <blockquote className="text-pretty text-base leading-relaxed text-background/70 sm:text-[1.05rem] sm:leading-8">
            <p>{KNOWLEDGE_QUOTE.text}</p>
            <footer className="mt-3 text-sm text-background/60">
              ——{KNOWLEDGE_QUOTE.source}
            </footer>
          </blockquote>

          <AnimatePresence mode="wait">
            {activePost ? <PostMeta key={activePost.slug} post={activePost} /> : null}
          </AnimatePresence>
        </div>

        <div className="min-w-0 md:col-start-2 md:row-start-2">
          <ul ref={listRef} role="list" className="md:mt-0">
            {items.map((post, index) => (
              <PostRow
                key={post.slug}
                post={post}
                index={index}
                active={index === activeIndex}
                onActivate={activateRow}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
