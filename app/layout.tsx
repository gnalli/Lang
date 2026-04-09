import "./globals.css"
import "lxgw-wenkai-webfont/style.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { siteConfig, siteAuthors } from "@/lib/config"
import Header from "@/components/header"
import FooterActions from "@/components/footer"
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" />
      </head>
      <body
        style={{ fontFamily: "LXGW WenKai, sans-serif" }}
        className="min-w-0 bg-background px-4 pt-16 sm:px-6"
      >
        {process.env.NODE_ENV === "development" && <Agentation />}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            <Header />
            {children}
            <FooterActions />
          </TooltipProvider>
        </ThemeProvider>
        <GoogleAnalytics gaId="G-GHZR0G837X" />
      </body>
    </html>
  )
}
