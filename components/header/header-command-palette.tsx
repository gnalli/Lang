"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uniqueTagsFromBlogs } from "@/lib/blog-tags"
import { allBlogs } from "content-collections"

export function HeaderCommandPalette() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const router = useRouter()
    const tags = uniqueTagsFromBlogs(allBlogs)
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

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault()
                setOpen(true)
            }
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    const openPalette = () => setOpen(true)

    /** 与 HeaderActions 图标按钮同档，极窄屏不占横向条，避免压住品牌文案 */
    const narrowSearchTriggerClass =
        "size-10 shrink-0 rounded-xl text-foreground/85 hover:bg-accent sm:size-11 [&_svg]:size-[1.15rem] sm:[&_svg]:size-5"

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={openPalette}
                className={cn(narrowSearchTriggerClass, "flex min-[520px]:hidden")}
                aria-label="打开快速导航"
            >
                <SearchIcon className="opacity-70 hidden min-[710px]:flex" strokeWidth={1.65} aria-hidden  />
            </Button>
            <button
                type="button"
                onClick={openPalette}
                className={cn(
                    "hidden min-[710px]:flex",
                    "h-9 min-w-0 shrink-0 items-center gap-2.5 rounded-full border-0 px-3.5 text-left outline-none",
                    "bg-muted/90 text-sm font-normal text-muted-foreground",
                    "transition-colors hover:bg-muted",
                    "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "dark:bg-muted/60 dark:hover:bg-muted/80",
                    "min-w-40 max-w-48 sm:h-10 sm:min-w-48 sm:max-w-[18rem] md:max-w-[20rem]",
                )}
                aria-label="打开快速导航"
            >
                <SearchIcon
                    className="size-[1.05rem] shrink-0 opacity-55 sm:size-4"
                    strokeWidth={1.65}
                    aria-hidden
                />
                <span className="truncate sm:text-[0.9375rem]">Search…</span>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command shouldFilter={false}>
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder="支持 Ctrl+K / ⌘K 唤醒，输入关键词搜索标题/内容…"
                    />
                    <CommandList>
                        <CommandEmpty>未找到匹配项</CommandEmpty>
                        {query.trim().length === 0 && (
                            <CommandGroup heading="博文分类">
                                {tags.map((tag) => (
                                    <CommandItem
                                        key={tag}
                                        value={tag}
                                        onSelect={() => {
                                            setOpen(false)
                                            setQuery("")
                                            router.push(`/tag/${encodeURIComponent(tag)}`)
                                        }}
                                    >
                                        <span>{tag}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {query.trim().length > 0 && (
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
                        )}
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    )
}
