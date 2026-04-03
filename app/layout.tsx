import "./globals.css"
import "lxgw-wenkai-webfont/style.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { siteConfig } from "@/lib/config"
import Header from "@/components/header"

export const metadata = {
  title: siteConfig.site.title,
  description: siteConfig.site.description,
  icons: siteConfig.site.icons,
  authors: siteConfig.site.authors,
  referrer: siteConfig.site.referrer,
  keywords: siteConfig.site.keywords,

  metadataBase: siteConfig.seo.metadataBase,
  alternates: siteConfig.seo.alternates,
  types: siteConfig.seo.types,
  openGraph: siteConfig.seo.openGraph,
  robots: siteConfig.seo.robots,
  verification: siteConfig.seo.verification,

  github: siteConfig.social.github,
  twitter: siteConfig.social.twitter,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        style={{ fontFamily: "LXGW WenKai, sans-serif" }}
        className="min-w-0 bg-background px-4 pt-16 sm:px-6"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            <Header />
            {children}
            {/* <section className="min-w-0">{children}</section> */}
            <footer></footer>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
