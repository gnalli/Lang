import { siteConfig } from "@/lib/config"
import {
  escapeXml,
  feedCacheHeaders,
  getPostsForFeed,
  getSiteOrigin,
} from "@/lib/feed-shared"

export const revalidate = 3600

function toAtomDate(isoOrDate: string): string {
  const d = new Date(isoOrDate)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

export async function GET() {
  const siteTitle = siteConfig.site.title.default
  const siteDesc = siteConfig.site.description
  const posts = getPostsForFeed()
  const baseUrl = getSiteOrigin()
  const atomSelf = `${baseUrl}/atom.xml`
  const homeUrl = `${baseUrl}/`

  const feedUpdated = posts[0]
    ? toAtomDate(posts[0].updated ?? posts[0].date)
    : new Date().toISOString()

  const entriesXml = posts
    .map((post) => {
      const pub = toAtomDate(post.date)
      const upd = toAtomDate(post.updated ?? post.date)
      return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link rel="alternate" type="text/html" href="${escapeXml(post.url)}" />
    <id>${escapeXml(post.url)}</id>
    <published>${pub}</published>
    <updated>${upd}</updated>
    <summary type="text">${escapeXml(post.summaryLine)}</summary>
  </entry>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteTitle)}</title>
  <subtitle>${escapeXml(siteDesc)}</subtitle>
  <link rel="alternate" type="text/html" href="${escapeXml(homeUrl)}" />
  <link rel="self" type="application/atom+xml" href="${escapeXml(atomSelf)}" />
  <id>${escapeXml(homeUrl)}</id>
  <updated>${feedUpdated}</updated>
${entriesXml}
</feed>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      ...feedCacheHeaders(),
    },
  })
}
