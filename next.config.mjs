/** @type {import('next').NextConfig} */
import createMDX from "@next/mdx"
import { withContentCollections } from "@content-collections/next"

const nextConfig = {
    pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
}

const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
})

export default withContentCollections(withMDX(nextConfig))
