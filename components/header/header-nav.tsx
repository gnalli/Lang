import Image from "next/image"
import Link from "next/link"
import { HeaderSearchProvider } from "./header-command-palette"
import { HeaderMoreMenu } from "./header-more-menu"
import { HeaderThemeToggle } from "./header-theme-toggle"
import { SITE_NAV_ITEMS } from "@/lib/site-nav"

const navLink =
  "text-sm leading-snug text-foreground transition-[color,transform] duration-200 ease-out hover:-translate-y-px hover:text-foreground/65 motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[375px]:text-[0.8125rem] sm:text-base"

export function HeaderNav() {
  return (
    <nav
      className="mx-auto flex w-fit max-w-[calc(100vw-1rem)] flex-wrap items-center justify-center gap-x-4 gap-y-1 border border-border/70 bg-background/75 px-2 py-1 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/65 max-[375px]:gap-x-3 max-[375px]:px-1.5 sm:gap-x-7 sm:px-4 sm:py-1.5"
      aria-label="主导航"
    >
      <Link href="/" className="shrink-0" aria-label="首页">
        <div className="relative size-5 overflow-hidden rounded-md bg-transparent sm:size-6">
          <Image
            src="/avatar-header.png"
            alt=""
            fill
            className="object-cover"
            sizes="24px"
            priority
          />
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 max-[375px]:gap-x-2.5 sm:gap-x-5">
        {SITE_NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={navLink}>
            {item.label}
          </Link>
        ))}

        <HeaderSearchProvider>
          <HeaderMoreMenu />
        </HeaderSearchProvider>
        <HeaderThemeToggle />
      </div>
    </nav>
  )
}
