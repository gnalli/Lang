import "./globals.css"
import "./fonts/wenkai/faces.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { siteConfig, siteAuthors } from "@/lib/config"
import Header from "@/components/header"
import { ScrollProgressBar } from "@/components/scroll-progress-bar"
import { GoogleAnalytics } from '@next/third-parties/google'
import { Agentation } from "agentation"

export const metadata = {
  title: siteConfig.site.title,
  description: siteConfig.site.description,
  authors: siteAuthors(),
  referrer: siteConfig.site.referrer,
  keywords: siteConfig.site.keywords,

  /** 与 seo.metadataBase 一致；相对 OG 等路径会相对此域名解析（见 Next Metadata 文档） */
  metadataBase: siteConfig.seo.metadataBase,
  alternates: siteConfig.seo.alternates,
  openGraph: siteConfig.seo.openGraph,
  robots: siteConfig.seo.robots,
  verification: siteConfig.seo.verification,
  icons: siteConfig.site.icons,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/wenkai/interface.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-w-0 bg-background">
        {process.env.NODE_ENV === "development" && <Agentation />}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            <div className="flex min-h-dvh flex-col">
              <ScrollProgressBar />
              <Header />
              {children}
            </div>
          </TooltipProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && (
          <GoogleAnalytics gaId="G-GHZR0G837X" />
        )}
      </body>
    </html>
  )
}
