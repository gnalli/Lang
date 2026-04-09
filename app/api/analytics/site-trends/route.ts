import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-auth"

/** 近 N 个自然日（UTC），含当天 */
const DAYS = 14

function utcDateKey(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate
  return d.toISOString().slice(0, 10)
}

export async function GET() {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json(
      { ok: false as const, reason: "not_configured" as const, series: [] },
      { status: 503 },
    )
  }

  const end = new Date()
  const startUtc = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
  )
  startUtc.setUTCDate(startUtc.getUTCDate() - (DAYS - 1))

  const { data, error } = await supabase
    .from("page_views")
    .select("created_at, visitor_id")
    .gte("created_at", startUtc.toISOString())

  if (error) {
    console.error("[analytics/site-trends]", error.message)
    return NextResponse.json(
      { ok: false as const, reason: "db_error" as const, series: [] },
      { status: 500 },
    )
  }

  const byDay = new Map<string, { pv: number; visitors: Set<string> }>()
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(startUtc)
    d.setUTCDate(startUtc.getUTCDate() + i)
    const key = utcDateKey(d)
    byDay.set(key, { pv: 0, visitors: new Set() })
  }

  for (const row of data ?? []) {
    const key = utcDateKey(row.created_at as string)
    const bucket = byDay.get(key)
    if (!bucket) continue
    bucket.pv += 1
    bucket.visitors.add(String(row.visitor_id))
  }

  const series = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      /** 轴标签：月-日 */
      label: `${date.slice(5, 7)}-${date.slice(8, 10)}`,
      pv: v.pv,
      uv: v.visitors.size,
    }))

  return NextResponse.json(
    { ok: true as const, series },
    {
      headers: {
        "Cache-Control": "private, s-maxage=120, stale-while-revalidate=300",
      },
    },
  )
}
