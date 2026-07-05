import MiniSearch from "minisearch"
import { allBlogs } from "content-collections"
import {
    MINI_SEARCH_INDEX_OPTIONS,
    type SearchIndexDoc,
} from "@/lib/search-index"

/** 服务端预构建 MiniSearch 索引，客户端 loadJSON 直接加载 */
export function buildSearchIndexExport() {
    const docs: SearchIndexDoc[] = allBlogs.map((blog) => ({
        id: blog.slug,
        slug: blog.slug,
        title: blog.title,
        summary: blog.summary ?? "",
        keywords: blog.keywords ?? "",
        content: blog.content,
    }))
    const engine = new MiniSearch<SearchIndexDoc>(MINI_SEARCH_INDEX_OPTIONS)
    engine.addAll(docs)
    return engine.toJSON()
}
