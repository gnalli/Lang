import type { ReactNode } from "react"

/** 抵消 main 的水平留白（不用 transform，避免破坏内部 position: fixed 元素的视口定位），与顶栏同一套 max-w-6xl px-4 sm:px-6，正文左缘对齐头像。 */
export default function BlogPostLayout({ children }: { children: ReactNode }) {
    return (
        <div className="-mx-4 sm:-mx-6">
            <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-16">
                {children}
            </div>
        </div>
    )
}
