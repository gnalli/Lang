import { siteConfig } from "@/lib/config"
import {
  escapeXml,
  feedCacheHeaders,
  getPostsForFeed,
  getSiteOrigin,
} from "@/lib/feed-shared"

export const revalidate = 3600

export async function GET() {
  const siteTitle = siteConfig.site.title.default
  const siteDesc = siteConfig.site.description
  const posts = getPostsForFeed()

  const itemsXml = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.url)}</link>
      <guid isPermaLink="true">${escapeXml(post.url)}</guid>
      <pubDate>${escapeXml(new Date(post.date).toUTCString())}</pubDate>
      <description>${escapeXml(post.summaryLine)}</description>
    </item>`,
    )
    .join("\n")

  const baseUrl = getSiteOrigin()
  const feedUrl = `${baseUrl}/rss.xml`
  const homeUrl = `${baseUrl}/`
  const lastBuild = posts[0]
    ? new Date(posts[0].updated ?? posts[0].date).toUTCString()
    : new Date().toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(homeUrl)}</link>
    <description>${escapeXml(siteDesc)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${escapeXml(lastBuild)}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      ...feedCacheHeaders(),
    },
  })
}
