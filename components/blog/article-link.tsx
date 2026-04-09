import Link from "next/link"
import type { ComponentPropsWithoutRef } from "react"
import { siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"

type AnchorProps = ComponentPropsWithoutRef<"a">

function siteOrigins(): string[] {
    return [new URL(siteConfig.seo.metadataBase).origin]
}

function sameOriginAsSite(href: string): boolean {
    try {
        const u = href.startsWith("//") ? new URL(`https:${href}`) : new URL(href)
        return siteOrigins().includes(u.origin)
    } catch {
        return false
    }
}

/** Markdown 外链新标签打开；站内链接（路径或同源绝对 URL）当前页打开 */
export function ArticleLink({ href, children, className, ...rest }: AnchorProps) {
    if (!href) {
        return (
            <a className={cn(className)} {...rest}>
                {children}
            </a>
        )
    }

    const h = href.trim()

    if (h.startsWith("#")) {
        return (
            <a href={h} className={cn(className)} {...rest}>
                {children}
            </a>
        )
    }

    if (h.startsWith("/")) {
        return (
            <Link href={h} className={cn(className)} {...rest}>
                {children}
            </Link>
        )
    }

    const isHttp =
        /^https?:\/\//i.test(h) || h.startsWith("//")
    if (isHttp && sameOriginAsSite(h)) {
        let path: string | null = null
        try {
            const u = h.startsWith("//") ? new URL(`https:${h}`) : new URL(h)
            path = `${u.pathname}${u.search}${u.hash}`
        } catch {
            path = null
        }
        if (path) {
            return (
                <Link href={path} className={cn(className)} {...rest}>
                    {children}
                </Link>
            )
        }
    }

    const external = isHttp && !sameOriginAsSite(h)
    return (
        <a
            href={href}
            className={cn(className)}
            {...rest}
            {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
        >
            {children}
        </a>
    )
}
