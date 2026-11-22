import type { MetadataRoute } from "next"
import { allBlogs } from "content-collections"
import { BLOG_SECTIONS, resolveBlogCategory } from "@/lib/blog-sections"
import { siteSeoOrigin } from "@/lib/config"

export const revalidate = 3600

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteSeoOrigin()

  function latestUpdate(blogs: typeof allBlogs) {
    const timestamps = blogs.map((blog) => Date.parse(blog.updated ?? blog.date)).filter(Number.isFinite)
    return timestamps.length ? new Date(Math.max(...timestamps)) : undefined
  }

  const latest = latestUpdate(allBlogs)
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: `${base}/archive`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    ...Object.values(BLOG_SECTIONS).map(({ category, href }) => ({
      url: base + href,
      lastModified: latestUpdate(allBlogs.filter((blog) => resolveBlogCategory(blog.category) === category)),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
  ]

  const posts: MetadataRoute.Sitemap = allBlogs.map((b) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: new Date(b.updated ?? b.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...staticEntries, ...posts]
}
