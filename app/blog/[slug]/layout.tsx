import type { ReactNode } from "react"

/** 破出 main 留白后，与顶栏同一套 max-w-6xl px-4 sm:px-6，正文左缘对齐头像。 */
export default function BlogPostLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
            <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-16">
                {children}
            </div>
        </div>
    )
}
