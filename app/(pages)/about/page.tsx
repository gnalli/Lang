import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  title: "关于我",
  description: siteConfig.site.description,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "关于我",
    description: siteConfig.site.description,
    type: "profile",
    url: "/about",
    locale: siteConfig.seo.openGraph.locale,
    siteName: siteConfig.seo.openGraph.siteName,
    images: siteConfig.seo.openGraph.images,
  },
}

export default function AboutPage() {
  return null
}
