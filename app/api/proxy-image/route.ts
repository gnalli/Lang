import { NextRequest, NextResponse } from "next/server"
import { isProxyableImageUrl } from "@/lib/proxied-image-src"

/**
 * 服务端代拉 CDN 图片，浏览器只访问本站同源 URL，不触发对 R2 的跨域/CORS。
 * 仅允许 `lib/proxied-image-src` 中的主机名，防止 SSRF。
 */
export async function GET(req: NextRequest) {
    const raw = req.nextUrl.searchParams.get("url")
    if (!raw || !isProxyableImageUrl(raw)) {
        return new NextResponse(null, { status: 403 })
    }

    let target: string
    try {
        target = new URL(raw.trim()).toString()
    } catch {
        return new NextResponse(null, { status: 400 })
    }

    const upstream = await fetch(target, {
        headers: { Accept: "image/*,*/*;q=0.8" },
        next: { revalidate: 86_400 },
    })

    if (!upstream.ok) {
        return new NextResponse(null, { status: upstream.status })
    }

    const contentType =
        upstream.headers.get("content-type") ?? "application/octet-stream"

    return new NextResponse(upstream.body, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, s-maxage=86400, max-age=3600",
        },
    })
}
