"use client"

import Giscus from "@giscus/react"
import { useEffect, useMemo, useSyncExternalStore } from "react"
import { useTheme } from "next-themes"

function useClientMounted() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    )
}

function effectiveTheme(resolvedTheme?: string) {
    if (resolvedTheme === "dark" || resolvedTheme === "light") {
        return resolvedTheme
    }
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
        return "dark"
    }
    return "light"
}

function giscusThemeUrl(theme: "light" | "dark", origin: string) {
    return theme === "dark"
        ? `${origin}/giscus/site-dark.css`
        : `${origin}/giscus/site-light.css`
}

export default function Comments() {
    const { resolvedTheme } = useTheme()
    const mounted = useClientMounted()

    const theme = useMemo(
        () => (mounted ? effectiveTheme(resolvedTheme) : undefined),
        [mounted, resolvedTheme],
    )

    const giscusTheme = useMemo(() => {
        if (!mounted || typeof window === "undefined" || !theme) return undefined
        return giscusThemeUrl(theme, window.location.origin)
    }, [mounted, theme])

    useEffect(() => {
        if (!giscusTheme) return

        const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame")
        if (!iframe?.contentWindow) return

        iframe.contentWindow.postMessage(
            {
                giscus: {
                    setConfig: {
                        theme: giscusTheme,
                    },
                },
            },
            "https://giscus.app",
        )
    }, [giscusTheme])

    if (!giscusTheme) {
        return <div id="comments" className="min-h-48" aria-busy="true" />
    }

    return (
        <Giscus
            key={giscusTheme}
            id="comments"
            repo="gnalli/Lang"
            repoId="R_kgDOR4-pxA"
            category="General"
            categoryId="DIC_kwDOR4-pxM4C59xP"
            mapping="pathname"
            strict="1"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            theme={giscusTheme}
            lang="zh-CN"
            loading="lazy"
        />
    )
}
