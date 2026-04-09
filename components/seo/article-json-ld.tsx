import {
  siteAuthors,
  siteConfig,
  siteSeoOrigin,
} from "@/lib/config"

type Blog = {
  title: string
  slug: string
  date: string
  updated?: string
  summary?: string | null
  keywords?: string | null
}

function iso(d: string): string {
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? d : t.toISOString()
}

function articleHeroImageAbs(): string | undefined {
  const configured = siteConfig.site.image?.trim()
  if (configured?.startsWith("http")) return configured
  if (configured) {
    try {
      return new URL(configured, siteConfig.seo.metadataBase).toString()
    } catch {
      return undefined
    }
  }
  const rel = siteConfig.seo.openGraph.images?.[0]?.url
  if (typeof rel !== "string") return undefined
  return rel.startsWith("http")
    ? rel
    : new URL(rel, siteConfig.seo.metadataBase).toString()
}

function articleKeywordList(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(/[,，;；]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ArticleJsonLd({ blog, pageUrl }: { blog: Blog; pageUrl: string }) {
  const publisherUrl = siteSeoOrigin()
  const image = articleHeroImageAbs()
  const keywords = articleKeywordList(blog.keywords)
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.summary?.trim() || undefined,
    datePublished: iso(blog.date),
    dateModified: iso(blog.updated ?? blog.date),
    inLanguage: "zh-CN",
    ...(image ? { image: [image] } : {}),
    ...(keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
    author: siteAuthors().map((a) => ({
      "@type": "Person",
      name: a.name,
      url: a.url,
    })),
    publisher: {
      "@type": "Organization",
      name: siteConfig.site.title.default,
      url: publisherUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
