/** 从 frontmatter 的 keywords 解析标签（支持英文逗号、中文逗号、分号） */
export function parseKeywords(raw: string | undefined | null): string[] {
    if (!raw || typeof raw !== "string") return []
    return raw
        .split(/[,，;；]/)
        .map((s) => s.trim())
        .filter(Boolean)
}

type BlogLike = { keywords?: string | null }

/** 全站去重后的标签列表（大小写不敏感去重，保留首次出现的写法） */
export function uniqueTagsFromBlogs(blogs: readonly BlogLike[]): string[] {
    const map = new Map<string, string>()
    for (const b of blogs) {
        for (const t of parseKeywords(b.keywords)) {
            const key = t.toLowerCase()
            if (!map.has(key)) map.set(key, t)
        }
    }
    return [...map.values()].sort((a, b) => a.localeCompare(b, "zh-CN"))
}

/** 某标签下的文章（匹配忽略大小写） */
export function blogsForTag<T extends BlogLike & { slug: string }>(
    blogs: readonly T[],
    tagParam: string,
): T[] {
    const needle = decodeURIComponent(tagParam).trim().toLowerCase()
    if (!needle) return []
    return blogs.filter((b) =>
        parseKeywords(b.keywords).some((k) => k.toLowerCase() === needle),
    )
}
