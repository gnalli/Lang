import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.site.title.default,
    short_name: siteConfig.site.title.default,
    description: siteConfig.site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#18181b",
    lang: "zh-CN",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  }
}
