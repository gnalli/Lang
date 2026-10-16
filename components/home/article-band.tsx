"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { Bookmark } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { ArticleCardList } from "@/components/home/article-card-list"
import type { HomeSectionCard } from "@/components/home/home-shelf"
import { cn } from "@/lib/utils"

const ARTICLES_QUOTE = {
  text: "盖文章，经国之大业，不朽之盛事。年寿有时而尽，荣乐止乎其身，二者必至之常期，未若文章之无穷。",
  source: "曹丕，《典论·论文》",
}

function SectionCount({ count }: { count: number }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mt-8 text-sm text-muted-foreground"
    >
      {count > 0 ? `${count.toLocaleString("zh-CN")} 篇` : "还没有文章"}
    </motion.p>
  )
}

export function ArticleBand({ sections }: { sections: HomeSectionCard[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const active = activeIndex !== null ? sections[activeIndex] : null

  const activate = (index: number, card: HTMLElement) => {
    if (!card.hasAttribute("data-settled")) {
      setActiveIndex(null)
      return
    }
    setActiveIndex(index)
  }

  const syncHover = useCallback(() => {
    const cards = document.querySelectorAll<HTMLElement>("#articles [data-section-index]")
    for (const card of cards) {
      const pointing = card.matches(":hover") || card === document.activeElement
      if (!pointing) continue
      if (!card.hasAttribute("data-settled")) {
        setActiveIndex(null)
        return
      }
      const index = Number(card.dataset.sectionIndex)
      setActiveIndex(Number.isNaN(index) ? null : index)
      return
    }
  }, [])

  return (
    <div
      className={cn(
        "grid flex-1 grid-rows-[auto_auto_minmax(0,1fr)]",
        "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:grid-rows-[auto_minmax(0,1fr)] md:items-stretch md:gap-x-12",
        "lg:gap-x-16 xl:gap-x-20",
      )}
      onMouseLeave={() => setActiveIndex(null)}
    >
      <h2
        id="home-articles-heading"
        className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:col-start-1 md:row-start-1 md:pr-4"
      >
        文章
      </h2>
      <div className="mt-6 md:col-start-1 md:row-start-2 md:mt-8 md:pr-4">
        <blockquote className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-[1.05rem] sm:leading-8">
          <p>{ARTICLES_QUOTE.text}</p>
          <footer className="mt-3 text-sm text-muted-foreground/80">
            ——{ARTICLES_QUOTE.source}
          </footer>
        </blockquote>
        <AnimatePresence mode="wait">
          {active ? <SectionCount key={active.href} count={active.count} /> : null}
        </AnimatePresence>
      </div>
      <ArticleCardList
        className="mt-8 flex min-h-0 flex-col gap-3 md:col-start-2 md:row-start-2 md:mt-8 md:gap-4"
        onSync={syncHover}
      >
        {sections.map((section, index) => (
          <li key={section.href} className="flex min-h-40 flex-1">
            <Link
              href={section.href}
              data-settle-lift=""
              data-section-index={index}
              onMouseEnter={(event) => activate(index, event.currentTarget)}
              onFocus={(event) => activate(index, event.currentTarget)}
              className="article-card flex h-full w-full flex-col justify-between rounded-2xl border border-article-card-border bg-article-card px-5 py-4 text-article-card-foreground no-underline transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-[settled]:hover:-translate-y-1 data-[settled]:focus-visible:-translate-y-1 motion-reduce:transition-none motion-reduce:data-[settled]:hover:translate-y-0 motion-reduce:data-[settled]:focus-visible:translate-y-0 sm:px-6 sm:py-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] tracking-[0.18em] text-article-card-foreground/45">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:mt-3 sm:text-4xl">
                    {section.label}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-article-card-foreground/70">
                    {section.lead}
                  </p>
                </div>
                <Bookmark
                  className="size-6 shrink-0 text-article-mark sm:size-7"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-article-card-foreground/15 pt-3 sm:mt-6 sm:pt-4">
                <p className="text-sm text-article-card-foreground/55">
                  {section.count > 0 ? `${section.count} 篇` : "暂无文章"}
                  <span className="ml-1.5" aria-hidden>
                    •
                  </span>
                </p>
                <span className="article-enter inline-flex shrink-0 items-center bg-article-enter px-3 py-1 text-xs text-article-enter-foreground">
                  进入 →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ArticleCardList>
    </div>
  )
}
