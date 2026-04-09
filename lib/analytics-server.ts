import "server-only"

import { unstable_cache } from "next/cache"
import { ANALYTICS_CACHE_REVALIDATE_SECONDS } from "@/lib/analytics-config"
import { getSupabaseAdmin } from "@/lib/supabase-auth"

export type BlogViewStatRow = {
  slug: string
  pv: number
  /** 来自 blog_slug_pv_totals 时为 0；来自视图时有近似 UV */
  uv: number
}

async function fetchTopBlogViewStats(limit: number): Promise<BlogViewStatRow[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []

  const { data: totalsRows, error: totalsError } = await supabase
    .from("blog_slug_pv_totals")
    .select("slug, pv")
    .order("pv", { ascending: false })
    .limit(limit)

  if (!totalsError && totalsRows && totalsRows.length > 0) {
    return totalsRows.map((row) => ({
      slug: row.slug as string,
      pv: Number(row.pv),
      uv: 0,
    }))
  }

  if (totalsError) {
    console.error("[analytics] blog_slug_pv_totals:", totalsError.message)
  }

  const { data: viewRows, error: viewError } = await supabase
    .from("blog_page_view_stats")
    .select("slug, pv, uv")
    .order("pv", { ascending: false })
    .limit(limit)

  if (viewError) {
    console.error("[analytics] blog_page_view_stats:", viewError.message)
    return []
  }

  return (viewRows ?? []).map((row) => ({
    slug: row.slug as string,
    pv: Number(row.pv),
    uv: Number(row.uv),
  }))
}

/** 排行榜：按 `ANALYTICS_CACHE_REVALIDATE_SECONDS` 全站去重缓存，避免每次打开首页都请求 Supabase */
export function getTopBlogViewStats(limit: number): Promise<BlogViewStatRow[]> {
  return unstable_cache(
    () => fetchTopBlogViewStats(limit),
    ["analytics-top-blog-stats", String(limit)],
    { revalidate: ANALYTICS_CACHE_REVALIDATE_SECONDS },
  )()
}

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

/** 多篇 slug 的 PV：与排行榜相同 revalidate 的独立缓存键（按 slug 集合区分） */
export function getSlugPvMap(slugs: string[]): Promise<Record<string, number>> {
  const cacheKey = [...new Set(slugs.filter(Boolean))].sort().join("\u0001") || "empty"
  return unstable_cache(
    () => fetchSlugPvMap(slugs),
    ["analytics-slug-pv", cacheKey],
    { revalidate: ANALYTICS_CACHE_REVALIDATE_SECONDS },
  )()
}
