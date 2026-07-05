"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
    /** 服务端从 `<pre>` 提取的纯文本，优先用于复制 */
    codeText: string
    /** 与外层 `<figure id>` 一致，复制失败时回退读取 DOM */
    figureId: string
}

export function ArticleCodeCopyButton({ codeText, figureId }: Props) {
    const [copied, setCopied] = React.useState(false)

    async function copy() {
        let text = codeText.trim()
        if (!text && typeof document !== "undefined") {
            const pre = document.getElementById(figureId)?.querySelector("pre")
            text = pre?.innerText ?? ""
        }
        if (!text) return
        try {
            await navigator.clipboard.writeText(text)
        } catch {
            return
        }
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={copied ? "已复制" : "复制代码"}
            onClick={() => void copy()}
        >
            {copied ? (
                <CheckIcon className="size-3.5" aria-hidden />
            ) : (
                <CopyIcon className="size-3.5" aria-hidden />
            )}
        </Button>
    )
}
