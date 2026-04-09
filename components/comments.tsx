"use client"

import Giscus from "@giscus/react"
import { useTheme } from "next-themes"

export default function Comments() {
    const { resolvedTheme } = useTheme()

    return (
        <Giscus
            id="comments"
            repo="Lynnull/Lang"
            repoId="R_kgDOR4-pxA"
            category="General"
            categoryId="DIC_kwDOR4-pxM4C59xP"
            mapping="pathname"
            strict="1"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            theme={resolvedTheme === "dark" ? "transparent_dark" : "light"}
            lang="zh-CN"
            loading="lazy"
        />
    )
}