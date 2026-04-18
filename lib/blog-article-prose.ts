import { cn } from "@/lib/utils"

/** Tailwind Typography：仅包在 MDX 正文外，标题区单独排版 */
export function blogArticleProseClassName() {
    return cn(
        "article-mdx-prose prose prose-neutral max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none",
        "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
        "prose-h1:text-[1.65rem] sm:prose-h1:text-[1.85rem] prose-h1:mt-10 prose-h1:mb-4 first:prose-h1:mt-0",
        "prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4",
        "prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3",
        "prose-h4:text-base prose-h4:mt-6 prose-h4:mb-2",
        "prose-p:leading-[1.75] prose-p:text-foreground/90",
        "prose-strong:font-semibold prose-strong:text-foreground",
        "prose-a:font-medium prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:text-primary/90",
        "prose-pre:my-4 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted/50 prose-pre:shadow-sm dark:prose-pre:bg-muted/25",
        "prose-pre:font-mono prose-pre:text-[0.75rem] prose-pre:leading-relaxed md:prose-pre:text-[0.8125rem]",
        "prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 marker:text-muted-foreground",
        "prose-hr:border-border prose-hr:my-10",
        "prose-blockquote:border-l-primary/35 prose-blockquote:text-muted-foreground",
        // 图片与上下正文的间距：改 my-* / mt-* / mb-* 即可（与段落 margin 叠加）
        "prose-img:mx-auto prose-img:my-4 prose-img:rounded-lg prose-img:border prose-img:border-border/70 prose-img:shadow-sm sm:prose-img:my-4",
        "prose-table:my-1 prose-table:min-w-full prose-table:w-max prose-table:border-collapse prose-table:text-[0.9375em] prose-table:text-foreground/90",
        "prose-table:border prose-table:border-border prose-table:rounded-lg",
        "prose-thead:border-border prose-tr:border-border",
        "prose-th:border prose-th:border-border prose-th:bg-muted/60 prose-th:px-3 prose-th:py-2 prose-th:font-semibold dark:prose-th:bg-muted/40",
        "prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2",
    )
}
