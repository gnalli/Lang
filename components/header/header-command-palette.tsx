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
import { allBlogs } from "content-collections"

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

export function HeaderSearchProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const router = useRouter()
    const blogDocs = React.useMemo(
        () =>
            allBlogs.map((blog) => ({
                id: blog.slug,
                slug: blog.slug,
                title: blog.title,
                summary: blog.summary ?? "",
                keywords: blog.keywords ?? "",
                content: blog.content,
            })),
        [],
    )
    const miniSearch = React.useMemo(() => {
        const engine = new MiniSearch<{
            id: string
            slug: string
            title: string
            summary: string
            keywords: string
            content: string
        }>({
            idField: "id",
            fields: ["title", "summary", "keywords", "content"],
            storeFields: ["slug", "title", "summary"],
            searchOptions: {
                prefix: true,
                fuzzy: 0.2,
            },
        })
        engine.addAll(blogDocs)
        return engine
    }, [blogDocs])
    const searchedBlogs = React.useMemo(() => {
        const trimmed = query.trim()
        if (!trimmed) return []
        return miniSearch.search(trimmed, { boost: { title: 3, keywords: 2 } }).slice(0, 8)
    }, [miniSearch, query])

    const openPalette = React.useCallback(() => setOpen(true), [])

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
                        {query.trim().length > 0 ? (
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
                                                router.push(`/blog/${encodeURIComponent(blog.slug)}`)
                                            }}
                                        >
                                            <div className="flex min-w-0 flex-col gap-0.5">
                                                <span className="truncate">{blog.title}</span>
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
