import type { MetadataRoute } from "next"
import { allBlogs } from "content-collections"
import { siteSeoOrigin } from "@/lib/config"

export const revalidate = 3600

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteSeoOrigin()

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/archive`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/ops`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/ai`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/notes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  const posts: MetadataRoute.Sitemap = allBlogs.map((b) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: new Date(b.updated ?? b.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...staticEntries, ...posts]
}
