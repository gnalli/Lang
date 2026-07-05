import "server-only"

import { unstable_cache } from "next/cache"
import { ANALYTICS_CACHE_REVALIDATE_SECONDS } from "@/lib/analytics-config"
import { getSupabaseAdmin } from "@/lib/supabase-auth"

async function fetchSlugPvMap(slugs: string[]): Promise<Record<string, number>> {
  const unique = [...new Set(slugs.filter(Boolean))]
  if (unique.length === 0) return {}

  const supabase = getSupabaseAdmin()
  if (!supabase) return Object.fromEntries(unique.map((s) => [s, 0]))

  const map: Record<string, number> = Object.fromEntries(unique.map((s) => [s, 0]))

  const { data: totalsRows, error: totalsError } = await supabase
    .from("blog_slug_pv_totals")
    .select("slug, pv")
    .in("slug", unique)

  const inTotals = new Set<string>()
  if (!totalsError && totalsRows) {
    for (const row of totalsRows) {
      const slug = row.slug as string
      inTotals.add(slug)
      map[slug] = Number(row.pv)
    }
  } else if (totalsError) {
    console.error("[analytics] blog_slug_pv_totals batch:", totalsError.message)
  }

  const needView = unique.filter((s) => !inTotals.has(s))

  if (needView.length > 0) {
    const { data: viewRows, error: viewError } = await supabase
      .from("blog_page_view_stats")
      .select("slug, pv")
      .in("slug", needView)

    if (!viewError && viewRows) {
      for (const row of viewRows) {
        map[row.slug as string] = Number(row.pv)
      }
    } else if (viewError) {
      console.error("[analytics] blog_page_view_stats batch:", viewError.message)
    }
  }

  return map
}

/** 多篇 slug 的 PV：按 `ANALYTICS_CACHE_REVALIDATE_SECONDS` 缓存（按 slug 集合区分） */
function getSlugPvMap(slugs: string[]): Promise<Record<string, number>> {
  const cacheKey = [...new Set(slugs.filter(Boolean))].sort().join("\u0001") || "empty"
  return unstable_cache(
    () => fetchSlugPvMap(slugs),
    ["analytics-slug-pv", cacheKey],
    { revalidate: ANALYTICS_CACHE_REVALIDATE_SECONDS },
  )()
}

/** 单篇博文 PV；Supabase 未配置时返回 null */
export async function getBlogSlugPageViews(slug: string): Promise<number | null> {
  if (!getSupabaseAdmin()) return null
  const map = await getSlugPvMap([slug])
  return map[slug] ?? 0
}
