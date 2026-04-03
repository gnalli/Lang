"use client"

import * as React from "react"
import Link from "next/link"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/config"
import { HeaderCommandPalette } from "./header-command-palette"

const iconBtn =
    "size-10 rounded-xl text-foreground/85 hover:bg-accent sm:size-11 [&_svg]:size-[1.15rem] sm:[&_svg]:size-5"

function ThemeToggleButton() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = mounted && resolvedTheme === "dark"

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`${iconBtn} max-[500px]:hidden`}
            aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
        >
            {isDark ? <Sun /> : <Moon />}
        </Button>
    )
}

function GitHubIconButton() {
    return (
        <Button asChild variant="ghost" size="icon" className={`${iconBtn} max-[560px]:hidden`}>
            <a href={siteConfig.social.github.url} target="_blank" rel="noreferrer noopener" aria-label="GitHub">
                <svg viewBox="0 0 24 24" className="size-[1.15rem] fill-current sm:size-5" aria-hidden>
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.05-1.61-4.05-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.48-1.33-5.48-5.92 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.76.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.61-5.49 5.91.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.21.7.82.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
            </a>
        </Button>
    )
}

const navLinkClass =
    "rounded-xl px-3 py-2 text-sm font-medium text-foreground/90 transition hover:bg-accent sm:text-base sm:px-3.5"

export function HeaderActions() {
    return (
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <HeaderCommandPalette />
            <Link href="/blog" className={`${navLinkClass} max-[340px]:hidden`}>
                占个位
            </Link>
            <Link href="/about" className={`${navLinkClass} max-[390px]:hidden`}>
                关于我
            </Link>
            <ThemeToggleButton />
            <GitHubIconButton />
        </div>
    )
}
