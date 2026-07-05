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

/** 找到 index 所属的一级（最浅 depth）标题在 items 中的下标 */
export function getTocTopLevelIndex(
    items: TocItem[],
    index: number,
    minDepth: number,
): number {
    for (let i = Math.min(index, items.length - 1); i >= 0; i--) {
        if (items[i]!.depth === minDepth) return i
    }
    return 0
}

export function tocSectionHasChildren(
    items: TocItem[],
    topLevelIndex: number,
    minDepth: number,
): boolean {
    for (let i = topLevelIndex + 1; i < items.length; i++) {
        if (items[i]!.depth === minDepth) return false
        if (items[i]!.depth > minDepth) return true
    }
    return false
}

/** 随滚动展开当前一级标题下的子项；默认仅展示一级标题 */
export function getVisibleTocIndices(
    items: TocItem[],
    activeIndex: number,
    minDepth: number,
): number[] {
    if (items.length === 0) return []

    const topLevelIndex = getTocTopLevelIndex(items, activeIndex, minDepth)
    const expandChildren = tocSectionHasChildren(items, topLevelIndex, minDepth)

    const indices: number[] = []
    for (let i = 0; i < items.length; i++) {
        if (items[i]!.depth === minDepth) {
            indices.push(i)
        } else if (
            expandChildren &&
            getTocTopLevelIndex(items, i, minDepth) === topLevelIndex
        ) {
            indices.push(i)
        }
    }
    return indices
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
