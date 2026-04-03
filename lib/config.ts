export const siteConfig = {
    site: {
        title: {
            default: 'My Blog',
            template: '%s | My Blog',
        },
        description: 'My Blog',
        icons: {
            icon: '/favicon.ico',
        },
        authors: [{
            name: 'Lang Li', url: 'https://www.example.com'
        }],
        referrer: 'origin-when-cross-origin',
        keywords: ['blog'],
        image: "https://xxx.com/og-image.png",  // 后续补充
    },
    social: {
        github: {
            url: 'https://github.com/langli',
            username: 'langli',
        },
        twitter: {
            //
        }
    },
    seo: {
        metadataBase: new URL('https://www.example.com/'),
        alternates: {
            canonical: '/',
        },
        types: {
            'application/rss+xml': '/rss.xml',
            'application/atom+xml': '/atom.xml',
            'application/json': '/feed.json',
        },
        openGraph: {
            title: 'My Blog',
            description: 'My Blog',
            locale: 'zh_CN',
            url: '/',
            siteName: 'My Blog',
            images: [
                {
                    url: '/og-image.png'
                }
            ],
            type: 'article',

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
            google: 'google',
        }
    }
}
