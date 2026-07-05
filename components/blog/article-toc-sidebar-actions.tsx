"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowUp, CheckIcon, CopyIcon, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ARTICLE_TOC_LINE_BASE_PX } from "@/components/blog/article-toc-fumadocs"
import { siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"

function ArticleTocDivider({ className }: { className?: string }) {
    return (
        <div
            className={cn("py-1", className)}
            style={{ paddingInlineStart: `${ARTICLE_TOC_LINE_BASE_PX}px` }}
            aria-hidden
        >
            <svg
                viewBox="0 0 88 10"
                className="h-2.5 w-20 text-border/80"
                fill="none"
            >
                <path
                    d="M0 5 C10 1.5 18 8.5 28 5 S46 1.5 56 5 S70 8.5 80 5 S86 7 88 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    )
}

function TocActionButton({
    label,
    onClick,
    children,
}: {
    label: string
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <div className="group/toc-action relative flex flex-col items-center">
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                aria-label={label}
                onClick={onClick}
            >
                {children}
            </Button>
            <span
                className={cn(
                    "pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[0.625rem] leading-none text-muted-foreground",
                    "opacity-0 transition-opacity duration-200 ease-out",
                    "group-hover/toc-action:opacity-100",
                )}
            >
                {label}
            </span>
        </div>
    )
}

function DonateQrSlot({
    src,
    alt,
    placeholderLabel,
}: {
    src?: string
    alt: string
    placeholderLabel: string
}) {
    if (src) {
        return (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border/60 bg-background">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="10rem"
                    className="object-contain p-1"
                />
            </div>
        )
    }

    return (
        <div
            className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/70 bg-muted/25 px-2 text-center"
            aria-hidden
        >
            <span className="text-[0.625rem] leading-snug text-muted-foreground/70">
                {placeholderLabel}
            </span>
        </div>
    )
}

function TocDonateButton() {
    const { message, wechatImage, alipayImage } = siteConfig.donate

    return (
        <div className="group/donate relative flex flex-col items-center">
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                aria-label="打赏"
            >
                <Gift className="size-3.5 shrink-0" aria-hidden />
            </Button>
            <span
                className={cn(
                    "pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[0.625rem] leading-none text-muted-foreground",
                    "opacity-0 transition-opacity duration-200 ease-out",
                    "group-hover/donate:opacity-100",
                )}
            >
                好活当赏
            </span>
            <div
                className={cn(
                    "pointer-events-none absolute bottom-full left-1/2 z-50 w-[min(21rem,calc(100vw-2rem))] -translate-x-[calc(50%+1.5rem)] pt-2",
                    "opacity-0 transition-opacity duration-200 ease-out",
                    "group-hover/donate:pointer-events-auto group-hover/donate:opacity-100",
                )}
            >
                <div className="overflow-hidden rounded-xl border border-border/70 bg-card px-4 pb-4 pt-3 shadow-lg">
                    <p className="mb-3 text-left text-xs text-muted-foreground">
                        {message}
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                        <DonateQrSlot
                            src={wechatImage}
                            alt="微信赞赏码"
                            placeholderLabel="微信收款码"
                        />
                        <DonateQrSlot
                            src={alipayImage}
                            alt="支付宝收款码"
                            placeholderLabel="支付宝收款码"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

type Props = {
    slug: string
    className?: string
}

export function ArticleTocSidebarActions({ slug, className }: Props) {
    const [copied, setCopied] = React.useState(false)

    const scrollToTop = React.useCallback(() => {
        document.getElementById("blog-post-top")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }, [])

    const copyMarkdown = React.useCallback(async () => {
        try {
            const response = await fetch(
                `/api/blog/${encodeURIComponent(slug)}/raw`,
            )
            if (!response.ok) return
            const text = await response.text()
            if (!text) return
            await navigator.clipboard.writeText(text)
        } catch {
            return
        }
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
    }, [slug])

    return (
        <div className={cn("mt-3", className)}>
            <ArticleTocDivider className="mb-3" />
            <div className="flex items-start gap-2 pb-4">
                <TocActionButton label="回到顶部" onClick={scrollToTop}>
                    <ArrowUp className="size-3.5 shrink-0" aria-hidden />
                </TocActionButton>
                <TocActionButton
                    label={copied ? "已复制" : "复制"}
                    onClick={() => void copyMarkdown()}
                >
                    {copied ? (
                        <CheckIcon className="size-3.5 shrink-0" aria-hidden />
                    ) : (
                        <CopyIcon className="size-3.5 shrink-0" aria-hidden />
                    )}
                </TocActionButton>
                <TocDonateButton /> 
            </div>
        </div>
    )
}
