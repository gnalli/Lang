"use client"

import type { TocItem } from "@/lib/extract-toc"
import { ArticleTocFumadocs } from "@/components/blog/article-toc-fumadocs"
import { ArticleTocSidebarActions } from "@/components/blog/article-toc-sidebar-actions"
import { SITE_HEADER_OFFSET } from "@/lib/site-header-offset"
import { cn } from "@/lib/utils"

type Props = {
    items: TocItem[]
    slug: string
}

export function ArticleTocSidebar({ items, slug }: Props) {
    if (items.length === 0) return null

    return (
        <aside
            className={cn(
                "pointer-events-auto sticky z-30 overflow-visible",
                SITE_HEADER_OFFSET.tocStickyTop,
            )}
        >
            <ArticleTocFumadocs items={items} showHeader />
            <ArticleTocSidebarActions slug={slug} />
        </aside>
    )
}
