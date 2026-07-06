"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { formatDateList } from "@/lib/format-date"
import { PostListInlineSummary } from "@/components/blog/post-list-inline-summary"
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
        <p className="text-sm leading-relaxed text-muted-foreground">
          {post.tags.map((tag, index) => (
            <React.Fragment key={tag}>
              {index > 0 ? (
                <span className="mx-1.5 text-muted-foreground/45">·</span>
              ) : null}
              <span>{tag}</span>
            </React.Fragment>
          ))}
        </p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {post.wordCount.toLocaleString("zh-CN")} 字
      </p>
    </motion.div>
  )
}

function PostRow({
  post,
  active,
  onActivate,
}: {
  post: RecentPostItem
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
          "group/row grid grid-cols-[5.5rem_1fr] gap-x-4 no-underline transition-colors duration-300 sm:grid-cols-[6.5rem_1fr] sm:gap-x-6",
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
          {formatDateList(post.date)}
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

export function HomeRecentPosts({ posts }: { posts: RecentPostItem[] }) {
  const items = posts.slice(0, DISPLAY_COUNT)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const activePost = activeIndex !== null ? items[activeIndex] : null

  if (items.length === 0) return null

  return (
    <section
      className="py-8 sm:py-12 md:py-16"
      aria-labelledby="recent-posts-heading"
      onMouseLeave={() => setActiveIndex(null)}
    >
      <div
        className={cn(
          "grid gap-y-12 sm:gap-y-14",
          "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:grid-rows-[auto_1fr] md:items-start md:gap-x-12 md:gap-y-0",
          "lg:gap-x-16 xl:gap-x-20",
        )}
      >
        <h2
          id="recent-posts-heading"
          className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:col-start-1 md:row-start-1 md:pr-4"
        >
          近期博文
        </h2>

        <div
          className="hidden min-w-0 md:col-start-2 md:row-start-1 md:block md:pt-1"
          aria-hidden
        >
          <div className="grid grid-cols-[5.5rem_1fr] gap-x-4 border-b border-foreground/15 pb-3 text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase sm:grid-cols-[6.5rem_1fr] sm:gap-x-6">
            <span>日期</span>
            <span>标题</span>
          </div>
        </div>

        <div className="md:col-start-1 md:row-start-2 md:mt-2 md:pr-4 lg:mt-4">
          <blockquote className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-[1.05rem] sm:leading-8">
            <p>{KNOWLEDGE_QUOTE.text}</p>
            <footer className="mt-3 text-sm text-muted-foreground/80">
              ——{KNOWLEDGE_QUOTE.source}
            </footer>
          </blockquote>

          <AnimatePresence mode="wait">
            {activePost ? <PostMeta key={activePost.slug} post={activePost} /> : null}
          </AnimatePresence>
        </div>

        <div className="min-w-0 md:col-start-2 md:row-start-2">
          <div
            className="grid grid-cols-[5.5rem_1fr] gap-x-4 border-b border-foreground/15 pb-3 text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase sm:grid-cols-[6.5rem_1fr] sm:gap-x-6 md:hidden"
            aria-hidden
          >
            <span>日期</span>
            <span>标题</span>
          </div>

          <ul role="list" className="md:mt-0">
            {items.map((post, index) => (
              <PostRow
                key={post.slug}
                post={post}
                active={index === activeIndex}
                onActivate={() => setActiveIndex(index)}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
