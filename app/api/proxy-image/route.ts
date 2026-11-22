import { NextRequest, NextResponse } from "next/server"
import { isProxyableImageUrl } from "@/lib/proxied-image-src"

const imageTypes = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif"])

/**
 * 服务端代拉 CDN 图片，浏览器只访问本站同源 URL，不触发对 R2 的跨域/CORS。
 * 仅允许 `lib/proxied-image-src` 中的主机名，防止 SSRF。
 */
export async function GET(req: NextRequest) {
    const raw = req.nextUrl.searchParams.get("url")
    if (!raw || !isProxyableImageUrl(raw)) {
        return new NextResponse(null, { status: 403 })
    }

    const signal = AbortSignal.timeout(15_000)
    let upstream: Response
    try {
        upstream = await fetch(raw.trim(), {
            headers: { Accept: "image/*" },
            redirect: "error",
            signal,
            next: { revalidate: 86_400 },
        })
    } catch {
        return new NextResponse(null, { status: signal.aborted ? 504 : 502 })
    }

    if (!upstream.ok) {
        await upstream.body?.cancel()
        return new NextResponse(null, { status: upstream.status })
    }

    const contentType = upstream.headers.get("content-type")?.split(";")[0].trim().toLowerCase()
    if (!contentType || !imageTypes.has(contentType)) {
        await upstream.body?.cancel()
        return new NextResponse(null, { status: 415 })
    }

    return new NextResponse(upstream.body, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, s-maxage=86400, max-age=3600",
        },
    })
}
