import type { MetadataRoute } from "next"
import { siteSeoOrigin } from "@/lib/config"

export default function robots(): MetadataRoute.Robots {
  const base = siteSeoOrigin()
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
