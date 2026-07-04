import { allBlogs } from "content-collections"
import { BrainCircuit } from "lucide-react"
import type { Metadata } from "next"
import { TopicPageShell } from "@/components/topic/topic-page-shell"
import { buildTopicPageData, BLOG_SECTIONS } from "@/lib/blog-sections"
import { siteConfig } from "@/lib/config"

const section = BLOG_SECTIONS.ai

export const metadata: Metadata = {
  title: section.title,
  description: section.description,
  alternates: { canonical: section.href },
  openGraph: {
    title: section.title,
    description: section.description,
    type: "website",
    url: section.href,
    locale: siteConfig.seo.openGraph.locale,
    siteName: siteConfig.seo.openGraph.siteName,
    images: siteConfig.seo.openGraph.images,
  },
}

export const revalidate = 120

export default function AiPage() {
  const { posts, tags } = buildTopicPageData(allBlogs, "ai")

  return (
    <TopicPageShell
      icon={BrainCircuit}
      title={section.title}
      titleParts={section.titleParts}
      posts={posts}
      tags={tags}
    />
  )
}
