import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

/** 宽表：外层横向滚动，避免挤爆正文栏 */
export function ArticleTable({ className, ...props }: ComponentPropsWithoutRef<"table">) {
    return (
        <div
            className={cn(
                "w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain",
                "[scrollbar-gutter:stable]",
            )}
        >
            <table className={cn(className)} {...props} />
        </div>
    )
}
