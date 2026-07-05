/** @type {import('next').NextConfig} */
import createMDX from "@next/mdx"
import bundleAnalyzer from "@next/bundle-analyzer"
import { withContentCollections } from "@content-collections/next"

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
})

const nextConfig = {
    pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.cnlang.net",
                pathname: "/**",
            },
        ],
    },
    async headers() {
        const securityHeaders = [
            {
                key: "Referrer-Policy",
                value: "strict-origin-when-cross-origin",
            },
            {
                key: "X-Frame-Options",
                value: "SAMEORIGIN",
            },
            {
                key: "X-Content-Type-Options",
                value: "nosniff",
            },
            {
                key: "X-DNS-Prefetch-Control",
                value: "on",
            },
            {
                key: "Permissions-Policy",
                value: "camera=(), microphone=(), geolocation=()",
            },
        ]

        return [
            {
                source: "/:path*",
                headers: securityHeaders,
            },
            {
                source: "/giscus/:path*",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*",
                    },
                ],
            },
        ]
    },
}

const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
})

export default withBundleAnalyzer(withContentCollections(withMDX(nextConfig)))
