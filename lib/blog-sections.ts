import { tagCountsFromBlogs, type TagCount } from "@/lib/blog-tags"
import { siteConfig } from "@/lib/config"

/** 博文栏目：在 frontmatter 中用 category 指定，未写则默认为 notes */
export const BLOG_CATEGORIES = ["ops", "ai", "notes"] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

export type BlogSectionConfig = {
  category: BlogCategory
  title: string
  description: string
  href: `/${BlogCategory}`
  /** 分类 tag 排序时置顶（如运维页的「网络」） */
  primaryTag?: string
  /** 英文前缀 + 中文后缀分开展示，避免混排高度不齐（如 AI教程） */
  titleParts?: { en: string; zh: string }
}

export const BLOG_SECTIONS: Record<BlogCategory, BlogSectionConfig> = {
  ops: {
    category: "ops",
    title: "运维教程",
    description: `运维相关教程与笔记 · ${siteConfig.site.title.default}`,
    href: "/ops",
    primaryTag: "网络",
  },
  ai: {
    category: "ai",
    title: "AI教程",
    titleParts: { en: "AI", zh: "教程" },
    description: `AI 应用、Agent 与实践经验 · ${siteConfig.site.title.default}`,
    href: "/ai",
  },
  notes: {
    category: "notes",
    title: "随记",
    description: `随想与短篇笔记 · ${siteConfig.site.title.default}`,
    href: "/notes",
  },
}

type BlogLike = {
  category?: string | null
  slug: string
  title: string
  date: string
  wordCount: number
  summary?: string | null
  keywords?: string | null
}

export type TopicPostItem = {
  slug: string
  title: string
  date: string
  wordCount: number
  summary?: string | null
  keywords?: string | null
}

export function resolveBlogCategory(raw: string | undefined | null): BlogCategory {
  if (raw === "ops" || raw === "ai" || raw === "notes") return raw
  return "notes"
}

/** 按 category 筛选博文（frontmatter `category: ops | ai | notes`） */
export function blogsForCategory<T extends { category?: string | null }>(
  blogs: readonly T[],
  category: BlogCategory,
): T[] {
  return blogs.filter((b) => resolveBlogCategory(b.category) === category)
}

export function sortSectionTags(tags: TagCount[], primaryTag?: string): TagCount[] {
  return [...tags].sort((a, b) => {
    if (primaryTag) {
      if (a.tag === primaryTag) return -1
      if (b.tag === primaryTag) return 1
    }
    return a.tag.localeCompare(b.tag, "zh-CN")
  })
}

export function buildTopicPageData(blogs: readonly BlogLike[], category: BlogCategory) {
  const section = BLOG_SECTIONS[category]
  const filtered = blogsForCategory(blogs, category)
  const posts: TopicPostItem[] = [...filtered]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((b) => ({
      slug: b.slug,
      title: b.title,
      date: b.date,
      wordCount: b.wordCount,
      summary: b.summary ?? null,
      keywords: b.keywords ?? null,
    }))
  const tags = sortSectionTags(tagCountsFromBlogs(filtered), section.primaryTag)

  return { section, posts, tags }
}
