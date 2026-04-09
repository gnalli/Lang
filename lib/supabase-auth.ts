import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let admin: SupabaseClient | null | undefined

/**
 * 仅用于服务端（API Route、Server Components）。
 * 需配置 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY（Settings → API → service_role，勿提交到仓库、勿用 NEXT_PUBLIC_ 前缀）。
 * 未配置时返回 null → /api/analytics/page-view 返回 503 not_configured
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (admin !== undefined) return admin

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    admin = null
    return admin
  }

  // 与删光 page_views RLS policy 后的行为一致：publishable 无法 INSERT → 401。见 Dashboard「Secret」里的 service_role。
  if (key.startsWith("sb_publishable_")) {
    console.error(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY 当前为 publishable（sb_publishable_…），请改为 API Settings 中的 service_role / secret 密钥。",
    )
    admin = null
    return admin
  }

  admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return admin
}
