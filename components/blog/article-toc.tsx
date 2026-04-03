import type { TocItem } from "@/lib/extract-toc"
import { formatTocLabel } from "@/lib/extract-toc"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type Props = {
    items: TocItem[]
    className?: string
}

/** 无边框目录：大屏由 FixedTocSlot 外层滚动；小屏块内 ScrollArea */
export function ArticleToc({ items, className }: Props) {
    if (items.length === 0) {
        return (
            <p className={cn("text-xs text-muted-foreground/90", className)}>暂无目录</p>
        )
    }

    const minDepth = Math.min(...items.map((i) => i.depth))

    const list = (
        <ul className="space-y-0.5 text-[0.8125rem] leading-snug">
            {items.map((item, index) => {
                const indent = Math.max(0, item.depth - minDepth)
                return (
                    <li key={`${item.id}-${index}`}>
                                <a
                                    href={`#${item.id}`}
                                    style={{ paddingLeft: `${indent * 0.75}rem` }}
                            className="block rounded-lg py-1.5 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                        >
                            <span className="line-clamp-3">{formatTocLabel(item.text)}</span>
                        </a>
                    </li>
                )
            })}
        </ul>
    )

    return (
        <nav aria-label="文章目录" className={cn(className)}>
            <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                目录
            </p>
            <div className="lg:hidden">
                <ScrollArea className="h-[min(58vh,24rem)] pr-2">{list}</ScrollArea>
            </div>
            <div className="hidden lg:block pr-2">{list}</div>
        </nav>
    )
}
