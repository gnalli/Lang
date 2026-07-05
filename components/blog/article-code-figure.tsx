import * as React from "react"
import { useId } from "react"
import {
    resolveCodeBlockLanguage,
    type CodeBlockLanguageMeta,
} from "@/lib/code-block-language"
import { cn } from "@/lib/utils"
import { ArticleCodeCopyButton } from "@/components/blog/article-code-copy-button"

function isPrettyCodeFigure(props: React.ComponentProps<"figure">) {
    return Object.hasOwn(props, "data-rehype-pretty-code-figure")
}

function readDataLanguage(props: Record<string, unknown>): string | undefined {
    const direct = props["data-language"]
    return typeof direct === "string" && direct ? direct : undefined
}

function isPreElement(node: React.ReactElement): boolean {
    return typeof node.type === "string" && node.type.toLowerCase() === "pre"
}

function flattenText(node: React.ReactNode): string {
    if (typeof node === "string") return node
    if (typeof node === "number") return String(node)
    if (Array.isArray(node)) return node.map(flattenText).join("")
    if (!React.isValidElement(node)) return ""

    const props = node.props as { children?: React.ReactNode }
    return flattenText(props.children)
}

function findLanguageInTree(node: React.ReactNode): string | undefined {
    if (!React.isValidElement(node)) return undefined

    const props = node.props as Record<string, unknown> & {
        children?: React.ReactNode
    }
    const lang = readDataLanguage(props)
    if (lang) return lang

    if (props.children) {
        for (const child of React.Children.toArray(props.children)) {
            const found = findLanguageInTree(child)
            if (found) return found
        }
    }

    return undefined
}

function findCodeTextInTree(node: React.ReactNode): string {
    if (!React.isValidElement(node)) return ""

    if (isPreElement(node)) {
        return flattenText((node.props as { children?: React.ReactNode }).children)
    }

    const props = node.props as { children?: React.ReactNode }
    if (!props.children) return ""

    for (const child of React.Children.toArray(props.children)) {
        const found = findCodeTextInTree(child)
        if (found) return found
    }

    return ""
}

function CodeBlockLanguageBadge({ meta }: { meta: CodeBlockLanguageMeta }) {
    return (
        <div className="flex min-w-0 items-center gap-2">
            <span
                className={cn(
                    "inline-flex h-5 shrink-0 items-center justify-center rounded-[4px] px-0.5 text-[8px] font-bold leading-none tracking-tight",
                    meta.badge.length <= 3 ? "w-5" : "min-w-5 px-1",
                    meta.badgeClassName,
                )}
                aria-hidden
            >
                {meta.badge}
            </span>
            <span className="truncate text-xs font-medium text-foreground/85">
                {meta.label}
            </span>
        </div>
    )
}

/** 普通 figure 原样渲染；rehype-pretty-code 生成的代码块加语言栏与复制 */
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
    const figureId = useId()
    const language = findLanguageInTree(children)
    const languageMeta = resolveCodeBlockLanguage(language)
    const codeText = findCodeTextInTree(children)

    return (
        <figure
            id={figureId}
            className={cn(
                "not-prose group/article-code relative my-4 w-full max-w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm",
                className,
            )}
            {...rest}
        >
            <div className="flex items-center justify-between gap-3 border-b border-border/80 bg-muted/25 px-3 py-2 dark:bg-muted/15">
                <CodeBlockLanguageBadge meta={languageMeta} />
                <ArticleCodeCopyButton codeText={codeText} figureId={figureId} />
            </div>
            <div
                className={cn(
                    "overflow-x-auto",
                    "[&_pre]:my-0 [&_pre]:rounded-none [&_pre]:border-0 [&_pre]:bg-transparent [&_pre]:px-4 [&_pre]:py-3 [&_pre]:font-mono [&_pre]:text-[0.75rem] [&_pre]:leading-relaxed sm:[&_pre]:text-[0.8125rem] [&_pre]:shadow-none",
                )}
            >
                {children}
            </div>
        </figure>
    )
}
