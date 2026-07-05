import localFont from "next/font/local"

/** GB2312 子集 Regular（约 1.5MB WOFF2），由 next/font 自托管 */
export const lxgwWenkai = localFont({
    src: "../node_modules/lxgw-wenkai-subset/woff2/lxgwwenkai-regular.subset.v1.235.2.gb2312.woff2",
    weight: "400",
    style: "normal",
    display: "swap",
    variable: "--font-lxgw-wenkai",
    fallback: [
        "PingFang SC",
        "Hiragino Sans GB",
        "Microsoft YaHei",
        "sans-serif",
    ],
})
