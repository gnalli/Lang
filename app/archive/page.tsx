import type { Metadata } from "next"
import { allBlogs } from "content-collections"
import { ArchiveListExpandable } from "@/components/archive/archive-list-expandable"
import {
  ArchiveEmptyState,
  ArchivePageIntro,
} from "@/components/archive/archive-page-intro"
import { siteConfig } from "@/lib/config"

const archiveDesc = `按年份归档的全部文章 · ${siteConfig.site.title.default}`

export const metadata: Metadata = {
  title: "存档",
  description: archiveDesc,
  alternates: {
    canonical: "/archive",
  },
  openGraph: {
    title: "存档",
    description: archiveDesc,
    type: "website",
    url: "/archive",
    locale: siteConfig.seo.openGraph.locale,
    siteName: siteConfig.seo.openGraph.siteName,
    images: siteConfig.seo.openGraph.images,
  },
}

/** 与首页等页面一致的静态再生间隔（数据来自构建期，仅控制 HTML 缓存节奏） */
export const revalidate = 120

export default function ArchivePage() {
  const sorted = [...allBlogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const posts = sorted.map((b) => ({
    slug: b.slug,
    title: b.title,
    date: b.date,
    wordCount: b.wordCount,
  }))

  return (
    <div className="mx-auto w-full max-w-5xl px-0 pb-20 pt-8 sm:pt-10">
      <ArchivePageIntro />

      {posts.length > 0 ? (
        <ArchiveListExpandable posts={posts} />
      ) : (
        <ArchiveEmptyState />
      )}
    </div>
  )
}
