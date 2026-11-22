"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { ArticleCardList } from "@/components/home/article-card-list"
import type { HomeSectionCard } from "@/components/home/home-shelf"
import { cn } from "@/lib/utils"

const ARTICLES_QUOTE = {
  text: "盖文章，经国之大业，不朽之盛事。年寿有时而尽，荣乐止乎其身，二者必至之常期，未若文章之无穷。",
  source: "曹丕，《典论·论文》",
}

export function ArticleBand({ sections }: { sections: HomeSectionCard[] }) {
  return (
    <div
      className={cn(
        "grid flex-1 content-center",
        "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start md:gap-x-12",
        "lg:gap-x-16 xl:gap-x-20",
      )}
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
      </div>
      <p className="mt-8 self-end text-xs font-medium tracking-wide text-muted-foreground md:col-start-2 md:row-start-1 md:mt-0">
        栏目
      </p>
      <div
        id="article-directory"
        className="relative mt-2 md:mt-8 border-t border-border md:col-start-2 md:row-start-2"
      >
        <ArticleCardList className="relative grid auto-rows-fr">
          {sections.map((section) => (
            <li key={section.href} className="border-b border-border last:border-0">
              <Link
                href={section.href}
                data-settle-lift=""
                className="group grid h-full min-h-24 grid-cols-[1fr_auto_auto] items-center gap-x-4 px-3 py-5 no-underline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring lg:min-h-28 lg:grid-cols-[auto_1fr_auto_auto] lg:gap-x-6 lg:px-5"
              >
                <h3 className="text-3xl font-semibold tracking-tight lg:min-w-20 lg:text-4xl">{section.label}</h3>
                <p className="col-start-1 row-start-2 mt-1 text-sm text-muted-foreground lg:col-start-2 lg:row-start-1 lg:mt-0">{section.lead}</p>
                <span className="col-start-2 row-span-2 row-start-1 whitespace-nowrap text-sm tabular-nums text-muted-foreground lg:col-start-3 lg:row-span-1">{section.count} 篇</span>
                <ArrowUpRight aria-hidden className="col-start-3 row-span-2 row-start-1 size-5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-data-settled:group-hover:translate-x-0.5 motion-safe:group-data-settled:group-hover:-translate-y-0.5 motion-safe:group-data-settled:group-focus-visible:translate-x-0.5 motion-safe:group-data-settled:group-focus-visible:-translate-y-0.5 lg:col-start-4 lg:row-span-1" strokeWidth={1.4} />
              </Link>
            </li>
          ))}
        </ArticleCardList>
      </div>
    </div>
  )
}
