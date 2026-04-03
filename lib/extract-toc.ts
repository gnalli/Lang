import GithubSlugger from "github-slugger"

export type TocItem = {
    depth: number
    /** 原始标题文本，用于生成与正文一致的锚点 id */
    text: string
    id: string
}

function stripFencedCode(markdown: string): string {
    return markdown.replace(/```[\s\S]*?```/g, "")
}

/** 目录展示用：去掉主章节「1. xxx」前的序号，避免与列表序号混淆 */
export function formatTocLabel(text: string): string {
    return text.trim().replace(/^\d+\.\s*/, "")
}

/** 与 rehype-slug / github-slugger 一致的 id，供大纲锚点跳转 */
export function extractToc(markdown: string): TocItem[] {
    const body = stripFencedCode(markdown)
    const slugger = new GithubSlugger()
    const items: TocItem[] = []

    for (const line of body.split("\n")) {
        const trimmed = line.trim()
        const m = /^(#{1,6})\s+(.+?)(?:\s+#*)?$/.exec(trimmed)
        if (!m) continue
        const depth = m[1]!.length
        const text = m[2]!.trim()
        if (!text) continue
        items.push({ depth, text, id: slugger.slug(text) })
    }

    return items
}
