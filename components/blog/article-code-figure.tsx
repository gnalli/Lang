"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function isPrettyCodeFigure(props: React.ComponentProps<"figure">) {
    return Object.hasOwn(props, "data-rehype-pretty-code-figure")
}

/** 普通 figure 原样渲染；rehype-pretty-code 生成的代码块仅加复制按钮 */
export function ArticleFigure(props: React.ComponentProps<"figure">) {
    if (!isPrettyCodeFigure(props)) {
        return <figure {...props} />
    }
    return <ArticleCodeFigure {...props} />
}

function ArticleCodeFigure({
    className,
    children,
    ...rest
}: React.ComponentProps<"figure">) {
    const rootRef = React.useRef<HTMLElement | null>(null)
    const [copied, setCopied] = React.useState(false)

    async function copy() {
        const pre = rootRef.current?.querySelector("pre")
        const text = pre?.innerText ?? ""
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
        <figure
            ref={rootRef}
            className={cn(
                "not-prose group/article-code relative my-4 w-full max-w-full overflow-hidden rounded-xl border border-border bg-muted/40 shadow-sm dark:bg-muted/20",
                className,
            )}
            {...rest}
        >
            <div className="pointer-events-none absolute top-1.5 right-1.5 z-10 sm:top-2 sm:right-2">
                <Button
                    type="button"
                    size="xs"
                    variant="secondary"
                    className="pointer-events-auto h-6 gap-1 px-2 shadow-sm backdrop-blur-sm"
                    onClick={() => void copy()}
                >
                    {copied ? (
                        <CheckIcon className="size-3" aria-hidden />
                    ) : (
                        <CopyIcon className="size-3" aria-hidden />
                    )}
                    {copied ? "已复制" : "复制"}
                </Button>
            </div>
            <div
                className={cn(
                    "overflow-x-auto",
                    /* 复制按钮绝对定位，不预留大块 padding；仅右侧略让出，避免与首行长代码重合 */
                    "[&_pre]:my-0 [&_pre]:rounded-none [&_pre]:border-0 [&_pre]:bg-transparent [&_pre]:px-4 [&_pre]:py-2.5 [&_pre]:pr-21 [&_pre]:font-mono [&_pre]:text-[0.75rem] [&_pre]:leading-relaxed sm:[&_pre]:text-[0.8125rem] [&_pre]:shadow-none sm:[&_pre]:pr-21",
                )}
            >
                {children}
            </div>
        </figure>
    )
}
