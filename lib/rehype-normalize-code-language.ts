import type { Root } from "hast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

/** 围栏语言标识统一小写，避免 ```Shell 等无法被 Shiki 识别 */
export const rehypeNormalizeCodeLanguage: Plugin<[], Root> = () => (tree) => {
    visit(tree, "element", (node) => {
        if (node.tagName !== "code") return
        const className = node.properties?.className
        if (!Array.isArray(className)) return

        node.properties!.className = className.map((item) => {
            if (typeof item !== "string" || !item.startsWith("language-")) {
                return item
            }
            const lang = item.slice("language-".length)
            return `language-${lang.toLowerCase()}`
        })
    })
}
