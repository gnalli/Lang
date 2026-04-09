import { HeaderActions } from "./header-actions"
import { HeaderBrand } from "./header-brand"

/** 与正文共用 max-w-6xl；fixed 后由自身 px 与 body 对齐 */
export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/60 bg-background/95 px-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/90 sm:px-6">
            <nav className="mx-auto flex h-16 w-full max-w-6xl flex-nowrap items-center gap-3">
                <HeaderBrand />
                <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
                    <HeaderActions />
                </div>
            </nav>
        </header>
    )
}
