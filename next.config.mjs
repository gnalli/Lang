/** @type {import('next').NextConfig} */
import createMDX from "@next/mdx"
import { withContentCollections } from "@content-collections/next"

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
}

const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
})

export default withContentCollections(withMDX(nextConfig))
