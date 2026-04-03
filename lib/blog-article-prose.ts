import { cn } from "@/lib/utils"

/** Tailwind Typography：仅包在 MDX 正文外，标题区单独排版 */
export function blogArticleProseClassName() {
    return cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
        "prose-h1:text-[1.65rem] sm:prose-h1:text-[1.85rem] prose-h1:mt-10 prose-h1:mb-4 first:prose-h1:mt-0",
        "prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4",
        "prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3",
        "prose-h4:text-base prose-h4:mt-6 prose-h4:mb-2",
        "prose-p:leading-[1.75] prose-p:text-foreground/90",
        "prose-strong:font-semibold prose-strong:text-foreground",
        "prose-a:font-medium prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:text-primary/90",
        "prose-code:rounded-md prose-code:border prose-code:border-border/70 prose-code:bg-muted/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.875em] prose-code:font-normal prose-code:text-foreground prose-code:shadow-none",
        "before:prose-code:content-none after:prose-code:content-none",
        "prose-pre:my-4 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted/50 prose-pre:shadow-sm dark:prose-pre:bg-muted/25",
        "prose-pre:text-[0.8125rem] prose-pre:leading-relaxed",
        "prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 marker:text-muted-foreground",
        "prose-hr:border-border prose-hr:my-10",
        "prose-blockquote:border-l-primary/35 prose-blockquote:text-muted-foreground",
        "prose-img:mx-auto prose-img:rounded-lg prose-img:border prose-img:border-border/70 prose-img:shadow-sm",
    )
}
