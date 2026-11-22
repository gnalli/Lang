"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
    preload: () => void
    openPalette: (origin?: HTMLElement) => void
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
    const [{ default: MiniSearch }, response] = await Promise.all([import("minisearch"), fetch(SEARCH_INDEX_URL)])
    if (!response.ok) {
        throw new Error("search index fetch failed")
    }
    const payload = (await response.json()) as SearchIndexPayload
    const index = MiniSearch.loadJSON<SearchIndexDoc>(
        JSON.stringify(payload.index),
        MINI_SEARCH_INDEX_OPTIONS,
    )
    return { index, wildcard: MiniSearch.wildcard } as const
}

export function HeaderSearchProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [engine, setEngine] = React.useState<Awaited<ReturnType<typeof fetchSearchEngine>> | null>(null)
    const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle")
    const requested = React.useRef(false)
    const router = useRouter()

    const ensureSearchEngine = React.useCallback(() => {
        if (requested.current) return
        requested.current = true
        setStatus("loading")
        void fetchSearchEngine().then((result) => {
            setEngine(result)
            setStatus("ready")
        }).catch(() => {
            requested.current = false
            setStatus("error")
        })
    }, [])

    const searchedBlogs = React.useMemo(() => {
        const trimmed = query.trim()
        if (!trimmed || !engine) return []
        const ranked = engine.index.search(trimmed, { boost: { title: 3, keywords: 2 } })
        if (!/\p{Script=Han}/u.test(trimmed)) return ranked.slice(0, 8)

        const needle = trimmed.toLowerCase()
        const matchesTitle = (blog: (typeof ranked)[number]) =>
            blog.title.toLowerCase().includes(needle)
        const titles = engine.index.search(engine.wildcard, {
            filter: matchesTitle,
        })
        const bySlug = new Map<string, (typeof ranked)[number]>()
        for (const blog of [...ranked.filter(matchesTitle), ...titles, ...ranked]) {
            if (!bySlug.has(blog.slug)) bySlug.set(blog.slug, blog)
        }
        return Array.from(bySlug.values()).slice(0, 8)
    }, [engine, query])

    const returnFocus = React.useRef<HTMLElement | null>(null)
    const openPalette = React.useCallback((origin?: HTMLElement) => {
        if (open) return
        returnFocus.current = origin ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
        setOpen(true)
        void ensureSearchEngine()
    }, [ensureSearchEngine, open])

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

    return (
        <HeaderSearchContext.Provider value={{ openPalette, preload: ensureSearchEngine }}>
            {children}
            <CommandDialog
                onCloseAutoFocus={(event) => {
                    event.preventDefault()
                    if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true })
                    returnFocus.current = null
                }}
                open={open} onOpenChange={setOpen} modal showCloseButton title="搜索文章" description="搜索文章标题或正文" className="max-sm:top-[max(1rem,env(safe-area-inset-top))] sm:max-w-xl!">
                <Command shouldFilter={false} onKeyDownCapture={(event) => {
                    if (event.key === "Enter" && (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)) {
                        event.stopPropagation()
                    }
                }}>
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        className="pr-8"
                        placeholder="搜索文章标题或正文"
                    />
                    <CommandList className="max-sm:max-h-[min(18rem,45dvh)] overscroll-contain">
                        {status === "loading" ? (
                            <p role="status" className="py-6 text-center text-sm text-muted-foreground">正在加载搜索索引…</p>
                        ) : status === "error" ? (
                            <div className="flex items-center justify-center gap-3 py-3 text-sm">
                                <span role="status">搜索索引加载失败</span>
                                <button type="button" className="min-h-11 underline" onClick={ensureSearchEngine}>重试</button>
                            </div>
                        ) : showResults ? (
                            <>
                                <CommandEmpty>未找到匹配项</CommandEmpty>
                                <CommandGroup heading="博文搜索">
                                    {searchedBlogs.map((blog) => (
                                        <CommandItem
                                            key={blog.id}
                                            value={`${blog.title} ${blog.summary ?? ""}`}
                                            onSelect={() => {
                                                returnFocus.current = null
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
                        ) : null}
                    </CommandList>
                </Command>
            </CommandDialog>
        </HeaderSearchContext.Provider>
    )
}
