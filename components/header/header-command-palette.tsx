"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { COMMAND_PALETTE_LINKS } from "./nav-links"

export function HeaderCommandPalette() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

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

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={cn(
                    "flex h-9 min-w-0 shrink-0 items-center gap-2.5 rounded-full border-0 px-3.5 text-left outline-none",
                    "bg-muted/90 text-sm font-normal text-muted-foreground",
                    "transition-colors hover:bg-muted",
                    "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "dark:bg-muted/60 dark:hover:bg-muted/80",
                    "max-[380px]:max-w-38 max-[380px]:px-3",
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
                <Command>
                    <CommandInput placeholder="支持 Ctrl+K / ⌘K 唤醒，输入关键词筛选…" />
                    <CommandList>
                        <CommandEmpty>未找到匹配项</CommandEmpty>
                        <CommandGroup heading="全部文章">
                            {COMMAND_PALETTE_LINKS.map((link) => (
                                <CommandItem
                                    key={link.name}
                                    value={link.name}
                                    onSelect={() => {
                                        setOpen(false)
                                        router.push(link.href)
                                    }}
                                >
                                    <span>{link.name}</span>
                                    {link.shortcut ? (
                                        <CommandShortcut>{link.shortcut}</CommandShortcut>
                                    ) : null}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    )
}
