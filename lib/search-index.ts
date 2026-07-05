import type { Options } from "minisearch"

/** 命令面板 MiniSearch 文档结构 */
export type SearchIndexDoc = {
    id: string
    slug: string
    title: string
    summary: string
    keywords: string
    content: string
}

/** MiniSearch 配置（服务端 export / 客户端 loadJSON 须完全一致） */
export const MINI_SEARCH_INDEX_OPTIONS: Options<SearchIndexDoc> = {
    idField: "id",
    fields: ["title", "summary", "keywords", "content"],
    storeFields: ["slug", "title", "summary"],
    searchOptions: {
        prefix: true,
        fuzzy: 0.2,
    },
}

export type SearchIndexPayload = {
    index: object
}
