import { allBlogs } from "content-collections"
import type { Metadata } from "next"
import { HomeHero } from "@/components/home/home-hero"
import { HomeRecentPosts } from "@/components/home/home-recent-posts"
import { parseKeywords } from "@/lib/blog-tags"
import { PageViewBeacon } from "@/components/analytics/page-view-beacon"
import { WebsiteJsonLd } from "@/components/seo/website-json-ld"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  description: siteConfig.site.description,
  openGraph: {
    type: "website",
    url: "/",
    title: siteConfig.site.title.default,
    description: siteConfig.site.description,
    siteName: siteConfig.seo.openGraph.siteName,
    locale: siteConfig.seo.openGraph.locale,
    images: siteConfig.seo.openGraph.images,
  },
}

/** 首页静态再生周期；与 `lib/analytics-config` 的 ANALYTICS_CACHE_REVALIDATE_SECONDS（120）及读库缓存一致；须为字面量以满足 Next 段配置校验 */
export const revalidate = 120

export default async function HomePage() {
  const sorted = [...allBlogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const recentItems = sorted.slice(0, 10).map((b) => ({
    slug: b.slug,
    title: b.title,
    date: b.date,
    wordCount: b.wordCount,
    summary: b.summary ?? null,
    tags: parseKeywords(b.keywords),
  }))

  return (
    <>
      <HomeHero />
      <div className="relative mx-auto w-full max-w-6xl pb-16 sm:pb-20">
        <WebsiteJsonLd />
        <HomeRecentPosts posts={recentItems} />
        <PageViewBeacon path="/" />
      </div>
    </>
  )
}
