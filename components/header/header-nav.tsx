import Image from "next/image"
import Link from "next/link"
import { HeaderNavActions } from "./header-nav-actions"
import { HeaderSearch } from "./header-search-button"
import { headerNavLinkClass } from "./nav-link-class"
import { SITE_NAV_ITEMS } from "@/lib/site-nav"

export function HeaderNav() {
  return (
    <nav
      className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-x-4 px-4 sm:px-6"
      aria-label="主导航"
    >
      <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="首页">
        <span className="relative size-7 overflow-hidden rounded-md ring-1 ring-border sm:size-8">
          <Image
            src="/avatar-header.png"
            alt=""
            fill
            className="object-cover"
            sizes="32px"
            priority
          />
        </span>
        <span className="hidden text-lg font-semibold tracking-tight text-foreground min-[420px]:inline">
          Lang.
        </span>
      </Link>

      <div className="flex items-center gap-x-3 max-[375px]:gap-x-2.5 sm:gap-x-5">
        <HeaderSearch />
        {SITE_NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={headerNavLinkClass}>
            {item.label}
          </Link>
        ))}

        <HeaderNavActions />
      </div>
    </nav>
  )
}
