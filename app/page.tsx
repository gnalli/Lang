import { allBlogs } from "content-collections"
import type { Metadata } from "next"
import {
  HomeSidebarPanels,
  type HomeRecommendedItem,
} from "@/components/home/home-sidebar-panels"
import { HomeSidebarMobileFab } from "@/components/home/home-sidebar-mobile-fab"
import { RecentPostsExpandable } from "@/components/home/recent-posts-expandable"
import { uniqueTagsFromBlogs } from "@/lib/blog-tags"
import { cn } from "@/lib/utils"
import { getSlugPvMap, getTopBlogViewStats } from "@/lib/analytics-server"
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
  const recentItems = sorted.map((b) => ({
    slug: b.slug,
    title: b.title,
    date: b.date,
    wordCount: b.wordCount,
    summary: b.summary ?? null,
  }))
  const tags = uniqueTagsFromBlogs(allBlogs)

  const bySlug = new Map(sorted.map((b) => [b.slug, b]))
  const viewStats = await getTopBlogViewStats(24)
  const recommendedBase: Omit<HomeRecommendedItem, "pageViews">[] = []
  const seen = new Set<string>()

  for (const row of viewStats) {
    const b = bySlug.get(row.slug)
    if (!b) continue
    recommendedBase.push({
      slug: b.slug,
      title: b.title,
      date: b.date,
    })
    seen.add(b.slug)
    if (recommendedBase.length >= 7) break
  }

  /** 阅读量不足时用精选/最新补齐 */
  if (recommendedBase.length < 7) {
    const featuredFirst = sorted.filter((b) => b.featured)
    const fallbackPool =
      featuredFirst.length > 0 ? featuredFirst : sorted
    for (const b of fallbackPool) {
      if (seen.has(b.slug)) continue
      recommendedBase.push({
        slug: b.slug,
        title: b.title,
        date: b.date,
      })
      seen.add(b.slug)
      if (recommendedBase.length >= 7) break
    }
  }

  const pvMap = await getSlugPvMap(recommendedBase.map((b) => b.slug))
  const recommendedItems: HomeRecommendedItem[] = recommendedBase.map((b) => ({
    ...b,
    pageViews: pvMap[b.slug] ?? 0,
  }))

  return (
    <div className="relative mx-auto w-full max-w-6xl pb-16 pt-6 sm:pb-20 sm:pt-8">
      <WebsiteJsonLd />
      <div
        className={cn(
          "grid items-start lg:items-stretch",
          "gap-x-12 lg:gap-x-20 xl:gap-x-28 2xl:gap-x-32",
          "gap-y-10 lg:gap-y-0",
          "lg:grid-cols-[minmax(0,38rem)_280px]",
          "lg:justify-center",
        )}
      >
        <div
          id="home-main-column"
          className="min-h-0 min-w-0 w-full max-w-full lg:max-w-none"
        >
          <header className="mb-4">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              近期博文
            </h1>
          </header>

          <RecentPostsExpandable posts={recentItems} />
        </div>

        <aside
          className={cn(
            "hidden min-w-0 w-full max-w-full lg:block lg:w-[280px] lg:max-w-[280px] lg:justify-self-end",
            "lg:sticky lg:top-24 lg:z-10 lg:self-start",
          )}
          aria-label="博文分类与推荐阅读"
        >
          <div className="flex min-w-0 w-full max-w-full flex-col gap-8 overflow-x-clip">
            <HomeSidebarPanels tags={tags} recommended={recommendedItems} />
          </div>
        </aside>
      </div>

      <HomeSidebarMobileFab tags={tags} recommended={recommendedItems} />

      <PageViewBeacon path="/" />
    </div>
  )
}
