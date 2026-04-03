import type { ReactNode } from "react"

/** 与 Header 同一 max-w-6xl，不再额外 px，避免与导航不对齐 */
export default function BlogPostLayout({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-6xl pb-16 pt-6 sm:pb-20 sm:pt-8">{children}</div>
    )
}
