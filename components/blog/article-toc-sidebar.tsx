"use client"

import type { TocItem } from "@/lib/extract-toc"
import { ArticleTocFumadocs } from "@/components/blog/article-toc-fumadocs"

type Props = {
    items: TocItem[]
}

export function ArticleTocSidebar({ items }: Props) {
    if (items.length === 0) return null

    return (
        <aside className="pointer-events-auto sticky top-24 z-30">
            <ArticleTocFumadocs items={items} showHeader />
        </aside>
    )
}
