import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"

const aboutDescription =
  "Former DevOps Engineer. Now building AI Agents, one prompt at a time."

export const metadata: Metadata = {
  title: "关于我",
  description: aboutDescription,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "关于我",
    description: aboutDescription,
    type: "profile",
    url: "/about",
    locale: siteConfig.seo.openGraph.locale,
    siteName: siteConfig.seo.openGraph.siteName,
    images: siteConfig.seo.openGraph.images,
  },
}

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl pb-20 pt-16 sm:pb-24 sm:pt-20">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        关于我
      </h1>

      <div className="mt-12 space-y-4 font-sans text-base leading-relaxed text-foreground sm:mt-16 sm:text-lg sm:leading-relaxed">
        <p>Hi, I&apos;m Lang 👋</p>
        <p>Former DevOps Engineer.</p>
        <p>Now building AI Agents, one prompt at a time.</p>
      </div>
    </div>
  )
}
