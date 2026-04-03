"use client"

import { ArrowUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const DEFAULT_THRESHOLD = 360

type Props = {
    className?: string
    targetId?: string
    /** 滚动超过多少像素后显示，默认 360 */
    scrollThreshold?: number
    /**
     * viewport：视口一角固定（小屏或无侧栏）
     * tocColumn：在右侧目录列底部，与目录同宽、右对齐（大屏有目录时）
     */
    placement?: "viewport" | "tocColumn"
}

export function GoToTopButton({
    className,
    targetId = "blog-post-top",
    scrollThreshold = DEFAULT_THRESHOLD,
    placement = "viewport",
}: Props) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onScroll = () => {
            setVisible(window.scrollY > scrollThreshold)
        }
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [scrollThreshold])

    const scrollTop = () => {
        if (typeof document === "undefined") return
        const el = document.getElementById(targetId)
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
        else window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const inSidebar = placement === "tocColumn"

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn(
                        "size-10 rounded-md border-0 shadow-md",
                        //"bg-foreground text-background",
                        "bg-gray-500 dark:bg-gray-400 text-background",
                        "hover:bg-foreground/90 hover:text-background",
                        "transition-opacity duration-300 ease-out",
                        visible ? "opacity-100" : "pointer-events-none opacity-0",
                        inSidebar ? "relative" : "fixed bottom-6 right-4 z-40 sm:right-6",
                        className,
                    )}
                    onClick={scrollTop}
                    aria-label="回到顶部"
                    aria-hidden={!visible}
                    tabIndex={visible ? 0 : -1}
                >
                    <ArrowUp className="size-4.5" strokeWidth={2.5} />
                </Button>
            </TooltipTrigger>
            <TooltipContent side={inSidebar ? "top" : "left"} className="text-xs">
                回到顶部
            </TooltipContent>
        </Tooltip>
    )
}
