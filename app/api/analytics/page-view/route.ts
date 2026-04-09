import { randomUUID } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { PAGE_VIEW_DEBOUNCE_MINUTES } from "@/lib/analytics-config"
import { getSupabaseAdmin } from "@/lib/supabase-auth"

const COOKIE = "blog_vid"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400

const bodySchema = z.object({
  path: z.string().min(1).max(2048).regex(/^\//u),
  slug: z.union([z.string().min(1).max(512), z.null()]).optional(),
})

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "validation_error" }, { status: 400 })
  }

  const { path, slug: rawSlug } = parsed.data
  const slug = rawSlug === undefined ? null : rawSlug

  if (slug && path !== `/blog/${slug}`) {
    return NextResponse.json({ ok: false, reason: "path_slug_mismatch" }, { status: 400 })
  }

  let visitorId = request.cookies.get(COOKIE)?.value
  const isNewVisitor = !visitorId
  if (!visitorId) visitorId = randomUUID()

  const debounceSince = new Date(
    Date.now() - PAGE_VIEW_DEBOUNCE_MINUTES * 60 * 1000,
  ).toISOString()

  let debounceQuery = supabase
    .from("page_views")
    .select("id")
    .eq("visitor_id", visitorId)
    .gte("created_at", debounceSince)
    .limit(1)

  debounceQuery = slug
    ? debounceQuery.eq("slug", slug)
    : debounceQuery.is("slug", null).eq("path", path)

  const { data: recentHit } = await debounceQuery

  if (recentHit?.length) {
    const res = NextResponse.json({ ok: true, deduped: true })
    if (isNewVisitor) {
      res.cookies.set(COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      })
    }
    return res
  }

  const { error } = await supabase.from("page_views").insert({
    path,
    slug,
    visitor_id: visitorId,
  })

  if (error) {
    console.error("[analytics] insert page_views:", error.message)
    return NextResponse.json({ ok: false, reason: "db_error" }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true })
  if (isNewVisitor) {
    res.cookies.set(COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    })
  }
  return res
}
