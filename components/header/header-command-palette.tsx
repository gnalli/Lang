"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import MiniSearch from "minisearch"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    MINI_SEARCH_INDEX_OPTIONS,
    type SearchIndexDoc,
    type SearchIndexPayload,
} from "@/lib/search-index"

const HeaderSearchContext = React.createContext<{
    openPalette: () => void
} | null>(null)

export function useHeaderSearch() {
    const context = React.useContext(HeaderSearchContext)
    if (!context) {
        throw new Error("useHeaderSearch must be used within HeaderSearchProvider")
    }
    return context
}

const SEARCH_INDEX_URL = "/api/search-index"

async function fetchSearchEngine() {
    const response = await fetch(SEARCH_INDEX_URL)
    if (!response.ok) {
        throw new Error("search index fetch failed")
    }
    const payload = (await response.json()) as SearchIndexPayload
    return MiniSearch.loadJSON(
        JSON.stringify(payload.index),
        MINI_SEARCH_INDEX_OPTIONS,
    )
}

export function HeaderSearchProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [miniSearch, setMiniSearch] = React.useState<MiniSearch<SearchIndexDoc> | null>(
        null,
    )
    const [indexLoading, setIndexLoading] = React.useState(true)
    const [indexError, setIndexError] = React.useState(false)
    const miniSearchRef = React.useRef<MiniSearch<SearchIndexDoc> | null>(null)
    const indexPromiseRef = React.useRef<Promise<MiniSearch<SearchIndexDoc>> | null>(null)
    const router = useRouter()

    const ensureSearchEngine = React.useCallback(async () => {
        if (miniSearchRef.current) return miniSearchRef.current
        if (indexPromiseRef.current) return indexPromiseRef.current

        const promise = fetchSearchEngine()
            .then((engine) => {
                miniSearchRef.current = engine
                setMiniSearch(engine)
                setIndexError(false)
                return engine
            })
            .catch((error) => {
                indexPromiseRef.current = null
                setIndexError(true)
                throw error
            })
            .finally(() => {
                setIndexLoading(false)
            })

        indexPromiseRef.current = promise
        return promise
    }, [])

    /** 页面加载后后台预取索引，打开面板时通常已就绪 */
    React.useEffect(() => {
        void ensureSearchEngine()
    }, [ensureSearchEngine])

    const searchedBlogs = React.useMemo(() => {
        const trimmed = query.trim()
        if (!trimmed || !miniSearch) return []
        return miniSearch.search(trimmed, { boost: { title: 3, keywords: 2 } }).slice(0, 8)
    }, [miniSearch, query])

    const openPalette = React.useCallback(() => {
        setOpen(true)
        void ensureSearchEngine()
    }, [ensureSearchEngine])

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault()
                openPalette()
            }
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [openPalette])

    const showResults = query.trim().length > 0
    const waitingForIndex = showResults && indexLoading && !miniSearch

    return (
        <HeaderSearchContext.Provider value={{ openPalette }}>
            {children}
            <CommandDialog open={open} onOpenChange={setOpen} className="sm:max-w-xl!">
                <Command shouldFilter={false}>
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder="支持 Ctrl+K / ⌘K 唤醒，输入关键词搜索标题/内容…"
                    />
                    <CommandList>
                        {showResults ? (
                            <>
                                {waitingForIndex ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        正在加载搜索索引…
                                    </p>
                                ) : indexError ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        搜索暂时不可用，请稍后重试
                                    </p>
                                ) : (
                                    <>
                                        <CommandEmpty>未找到匹配项</CommandEmpty>
                                        <CommandGroup heading="博文搜索">
                                            {searchedBlogs.map((blog) => (
                                                <CommandItem
                                                    key={blog.id}
                                                    value={`${blog.title} ${blog.summary ?? ""}`}
                                                    onSelect={() => {
                                                        setOpen(false)
                                                        setQuery("")
                                                        router.push(
                                                            `/blog/${encodeURIComponent(blog.slug)}`,
                                                        )
                                                    }}
                                                >
                                                    <div className="flex min-w-0 flex-col gap-0.5">
                                                        <span className="truncate">
                                                            {blog.title}
                                                        </span>
                                                        {blog.summary ? (
                                                            <span className="line-clamp-1 text-xs text-muted-foreground">
                                                                {blog.summary}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </>
                                )}
                            </>
                        ) : null}
                    </CommandList>
                </Command>
            </CommandDialog>
        </HeaderSearchContext.Provider>
    )
}
