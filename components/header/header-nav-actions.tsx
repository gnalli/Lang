"use client"

import { HeaderAnalyticsButton } from "./header-analytics-button"
import { HeaderThemeToggle } from "./header-theme-toggle"

/** 访问趋势、主题切换。间距与文字链接组相同。搜索在「文章」前面。 */
export function HeaderNavActions() {
  return (
    <div className="flex items-center gap-x-3 max-[375px]:gap-x-2.5 sm:gap-x-5">
      <HeaderAnalyticsButton />
      <HeaderThemeToggle />
    </div>
  )
}
