import {
  BLOG_SECTIONS,
  resolveBlogCategory,
} from "@/lib/blog-sections"
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
  category?: string | null
}

function iso(d: string): string {
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? d : t.toISOString()
}

function absUrl(path: string): string {
  const base = siteSeoOrigin()
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
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

function publisherLogoAbs(): string | undefined {
  return articleHeroImageAbs()
}

function articleKeywordList(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(/[,，;；]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function buildBreadcrumbList(blog: Blog, pageUrl: string) {
  const section = BLOG_SECTIONS[resolveBlogCategory(blog.category)]
  const sectionUrl = absUrl(section.href)

  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首页",
        item: absUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: section.title,
        item: sectionUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: pageUrl,
      },
    ],
  }
}

export function ArticleJsonLd({ blog, pageUrl }: { blog: Blog; pageUrl: string }) {
  const publisherUrl = siteSeoOrigin()
  const image = articleHeroImageAbs()
  const logo = publisherLogoAbs()
  const keywords = articleKeywordList(blog.keywords)
  const section = BLOG_SECTIONS[resolveBlogCategory(blog.category)]

  const blogPosting = {
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.summary?.trim() || undefined,
    datePublished: iso(blog.date),
    dateModified: iso(blog.updated ?? blog.date),
    inLanguage: "zh-CN",
    articleSection: section.title,
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
      ...(logo
        ? {
            logo: {
              "@type": "ImageObject",
              url: logo,
            },
          }
        : {}),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  }

  const data = {
    "@context": "https://schema.org",
    "@graph": [blogPosting, buildBreadcrumbList(blog, pageUrl)],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
