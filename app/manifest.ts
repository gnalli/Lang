import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.site.title.default,
    short_name: siteConfig.site.title.default,
    description: siteConfig.site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f8f4ee",
    theme_color: "#18181b",
    lang: "zh-CN",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
