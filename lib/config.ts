/** 站点默认摘要（meta / OG / JSON-LD） */
const defaultSiteDescription =
    "Lang 的个人技术博客，记录云原生、前后端开发与数据库、中间件等领域的学习笔记与实践总结。"

export const siteConfig = {
    site: {
        title: {
            default: "Lang's Blog",
            template: "%s | Lang's Blog",
        },
        description: defaultSiteDescription,
        /** 展示名与个人页路径；完整 URL 由 `siteAuthorProfileUrl()` / `siteAuthors()` 按环境拼接 */
        author: {
            name: 'Lang',
            profilePath: '/about',
        },
        referrer: 'origin-when-cross-origin',
        keywords: ['blog'],
        image: "https://cdn.cnlang.net/og-image.png",  // 后续补充
        icons: {
            icon: '/favicon.ico',
            shortcut: '/favicon.ico',
            apple: '/apple-icon.png'
        }
    },
    social: {
        github: {
            url: 'https://github.com/gnalli',
            username: 'gnalli',
        },
    },
    seo: {
        metadataBase: new URL('https://www.cnlang.net/'),
        alternates: {
            canonical: '/',
            types: {
                'application/rss+xml': '/rss.xml',
                'application/atom+xml': '/atom.xml',
            },
        },
        openGraph: {
            title: "Lang's Blog",
            description: defaultSiteDescription,
            locale: 'zh_CN',
            url: '/',
            siteName: "Lang's Blog",
            images: [
                {
                    url: '/og-image.png'
                }
            ],
            type: 'website',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                noimageindex: false,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        verification: {
            google: 'mgIluz7N4SUy0mS_pJaQz8bRBoJhzpIIOw1ww4c6zEo'
        }
    }
}

/**
 * 当前站点根 URL（无尾斜杠）。
 * 开发环境在 `.env` 设置 `NEXT_PUBLIC_APP_URL=http://localhost:3000`；
 * 未设置时回退到生产 `seo.metadataBase`。
 */
export function sitePublicOrigin(): string {
    const raw = process.env.NEXT_PUBLIC_APP_URL?.trim()
    if (raw) {
        return raw.replace(/\/$/, "")
    }
    return new URL(siteConfig.seo.metadataBase).origin.replace(/\/$/, "")
}

/** 作者个人页绝对地址（与当前环境域名一致） */
export function siteAuthorProfileUrl(): string {
    const p = siteConfig.site.author.profilePath.trim()
    const path = p.startsWith("/") ? p : `/${p}`
    return `${sitePublicOrigin()}${path}`
}

/** 供 `metadata.authors`、JSON-LD 等 */
export function siteAuthors(): { name: string; url: string }[] {
    return [
        {
            name: siteConfig.site.author.name,
            url: siteAuthorProfileUrl(),
        },
    ]
}

/** SEO canonical 站点根（无尾斜杠），与 sitemap / 正文 canonical 一致 */
export function siteSeoOrigin(): string {
    return new URL(siteConfig.seo.metadataBase).origin.replace(/\/$/, "")
}
