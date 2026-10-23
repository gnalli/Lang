"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/** 首页和内页各渲染一份服务端页脚，这里只按路径挑出要显示的那份。 */
export function FooterSwitch({
  home,
  page,
}: {
  home: ReactNode
  page: ReactNode
}) {
  const pathname = usePathname()
  console.log("当前的 pathname 实际上是:", pathname) // 看看到底打印了啥
  return pathname === "/" ? home : page;
}
