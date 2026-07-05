"use client"

import type { TocItem } from "@/lib/extract-toc"
import { ArticleTocFumadocs } from "@/components/blog/article-toc-fumadocs"
import { ArticleTocSidebarActions } from "@/components/blog/article-toc-sidebar-actions"

type Props = {
    items: TocItem[]
    slug: string
}

export function ArticleTocSidebar({ items, slug }: Props) {
    if (items.length === 0) return null

    return (
        <aside className="pointer-events-auto sticky top-24 z-30 overflow-visible">
            <ArticleTocFumadocs items={items} showHeader />
            <ArticleTocSidebarActions slug={slug} />
        </aside>
    )
}
