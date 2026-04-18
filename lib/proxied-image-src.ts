import { siteConfig } from "@/lib/config"

/** 与 `siteConfig.site.image` 同源 CDN，用于 `/api/proxy-image` 白名单（支持绝对 URL 或相对 `metadataBase`） */
function imageCdnHostname(): string | null {
    const raw = siteConfig.site.image.trim()
    if (!raw) return null
    try {
        return new URL(raw).hostname.toLowerCase()
    } catch {
        try {
            return new URL(raw, siteConfig.seo.metadataBase).hostname.toLowerCase()
        } catch {
            return null
        }
    }
}

/**
 * 允许通过 `/api/proxy-image` 转发的图片主机（与 `siteConfig.site.image` 的 hostname 一致）
 */
function allowedImageHosts(): Set<string> {
    const h = imageCdnHostname()
    return h ? new Set([h]) : new Set()
}

/** 是否为可代理的 https 外链（防 SSRF：仅白名单主机） */
export function isProxyableImageUrl(src: string): boolean {
    const t = src.trim()
    if (!t || !/^https:\/\//i.test(t)) return false
    try {
        const u = new URL(t)
        return allowedImageHosts().has(u.hostname.toLowerCase())
    } catch {
        return false
    }
}

/**
 * 将受信 CDN 图片转为同源代理 URL，避免浏览器对 `<img>` 的跨域/CORS/防盗链与 curl 行为不一致。
 * 非 https 或非白名单则原样返回（如 `/images/...`）。
 */
export function getProxiedImageSrcForBrowser(src: string): string {
    if (!isProxyableImageUrl(src)) return src.trim()
    return `/api/proxy-image?url=${encodeURIComponent(src.trim())}`
}
