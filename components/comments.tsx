"use client"

import Giscus from "@giscus/react"
import { useEffect, useMemo } from "react"
import { useTheme } from "next-themes"

export default function Comments() {
    const { resolvedTheme } = useTheme()
    const giscusTheme = useMemo(
        () => (resolvedTheme === "dark" ? "transparent_dark" : "light"),
        [resolvedTheme],
    )

    useEffect(() => {
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

    return (
        <Giscus
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