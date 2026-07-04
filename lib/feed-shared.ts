import { allBlogs } from "content-collections"
import { parseKeywords } from "@/lib/blog-tags"
import { siteConfig, siteSeoOrigin } from "@/lib/config"

export function getSiteOrigin(): string {
  return siteSeoOrigin()
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export type FeedPost = {
  title: string
  slug: string
  date: string
  updated?: string
  summaryLine: string
  url: string
  authorName: string
  categories: string[]
}

export function getPostsForFeed(): FeedPost[] {
  const base = getSiteOrigin()
  const authorName = siteConfig.site.author.name
  const sorted = [...allBlogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  return sorted.map((post) => ({
    title: post.title,
    slug: post.slug,
    date: post.date,
    updated: post.updated,
    summaryLine:
      post.summary?.trim() || `${post.wordCount} 字 · 点击查看全文`,
    url: `${base}/blog/${post.slug}`,
    authorName,
    categories: parseKeywords(post.keywords),
  }))
}

/** RSS 2.0 `<category>` 行（无标签时返回空字符串） */
export function rssItemCategoriesXml(categories: readonly string[]): string {
  if (categories.length === 0) return ""
  return categories
    .map((c) => `      <category>${escapeXml(c)}</category>`)
    .join("\n")
}

/** Atom `<category term="…" />` 行（无标签时返回空字符串） */
export function atomEntryCategoriesXml(categories: readonly string[]): string {
  if (categories.length === 0) return ""
  return categories
    .map((c) => `    <category term="${escapeXml(c)}" />`)
    .join("\n")
}

export function feedCacheHeaders(): HeadersInit {
  return {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  }
}
