import { siteConfig, sitePublicOrigin } from "@/lib/config"

export function WebsiteJsonLd() {
  const url = sitePublicOrigin()
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.site.title.default,
    description: siteConfig.site.description,
    url,
    inLanguage: "zh-CN",
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
