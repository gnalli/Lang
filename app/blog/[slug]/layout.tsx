import type { ReactNode } from "react"

/** 与 Header 同级的 max-w-6xl 容器；正文 + 目录栅格见 BlogPostShell */
export default function BlogPostLayout({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-6xl pb-16 pt-14 sm:pb-20 sm:pt-16">{children}</div>
    )
}
