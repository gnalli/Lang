/** 从 frontmatter 的 keywords 解析标签（支持英文逗号、中文逗号、分号、顿号、竖线） */
export function parseKeywords(raw: string | undefined | null): string[] {
    if (!raw || typeof raw !== "string") return []
    return raw
        .split(/[,，;；、|]/)
        .map((s) => s.trim())
        .filter(Boolean)
}

type BlogLike = { keywords?: string | null }

export type TagCount = { tag: string; count: number }

/** 各标签及对应文章数（一篇文章含多标签时分别计数） */
export function tagCountsFromBlogs(blogs: readonly BlogLike[]): TagCount[] {
    const map = new Map<string, TagCount>()
    for (const b of blogs) {
        for (const t of parseKeywords(b.keywords)) {
            const key = t.toLowerCase()
            const existing = map.get(key)
            if (existing) {
                existing.count += 1
            } else {
                map.set(key, { tag: t, count: 1 })
            }
        }
    }
    return [...map.values()].sort((a, b) => a.tag.localeCompare(b.tag, "zh-CN"))
}
