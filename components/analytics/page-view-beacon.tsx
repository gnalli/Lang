"use client"

import * as React from "react"

type Props = {
  path: string
  slug?: string | null
}

/**
 * 客户端打点到 /api/analytics/page-view，配合 HttpOnly visitor Cookie 做 UV 近似统计。
 */
export function PageViewBeacon({ path, slug }: Props) {
  React.useEffect(() => {
    void fetch("/api/analytics/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({ path, slug: slug ?? null }),
    })
      .then(async (res) => {
        if (process.env.NODE_ENV !== "development") return
        const text = await res.text()
        if (!res.ok) {
          console.warn("[analytics/page-view]", res.status, text)
          return
        }
        try {
          const body = JSON.parse(text) as { deduped?: boolean }
          if (body.deduped) console.debug("[analytics/page-view] 已去重，未写入")
        } catch {
          /* ignore */
        }
      })
      .catch(() => {})
  }, [path, slug])

  return null
}
