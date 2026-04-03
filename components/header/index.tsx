import { HeaderActions } from "./header-actions"
import { HeaderBrand } from "./header-brand"

/** 与正文共用 max-w-6xl；fixed 后由自身 px 与 body 对齐 */
export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/60 bg-background/95 px-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/90 sm:px-6">
        {/* <header className="fixed  left-1/2 z-50 w-[70vw] -translate-x-1/2 border-b border-border/60 bg-background/95 px-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/90 sm:px-6 top-0 rounded-2xl border"> */}
            {/* <link
                href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.min.css"
                rel="stylesheet"
            /> */}
            <nav className="mx-auto flex h-16 w-full max-w-6xl flex-nowrap items-center gap-3">
                <HeaderBrand />
                <HeaderActions />
            </nav>
        </header>
    )
}
