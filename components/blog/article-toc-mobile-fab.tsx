"use client"

import * as React from "react"
import { ListTree } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ArticleToc } from "@/components/blog/article-toc"
import type { TocItem } from "@/lib/extract-toc"
import { formatTocLabel } from "@/lib/extract-toc"
import { cn } from "@/lib/utils"

const DRAWER_TITLE = "本页目录"
const MIN_PX = 192 // 12rem，偏窄下限
const MAX_REM = 22

/** 按目录标题与「本页目录」标题的测量宽度估算抽屉宽度（单屏内上限随视口变化） */
function measureTocDrawerWidthPx(items: TocItem[]): number {
  if (typeof window === "undefined") {
    return MIN_PX
  }
  const maxCap = Math.min(window.innerWidth * 0.88, MAX_REM * 16)
  if (items.length === 0) {
    return Math.min(Math.max(MIN_PX, 200), maxCap)
  }

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return Math.min(280, maxCap)
  }

  const minDepth = Math.min(...items.map((i) => i.depth))
  ctx.font =
    '500 13.6px ui-sans-serif, system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
  let maxInner = 0
  for (const item of items) {
    const indentPx = Math.max(0, item.depth - minDepth) * 12
    const label = formatTocLabel(item.text)
    maxInner = Math.max(maxInner, indentPx + ctx.measureText(label).width)
  }

  ctx.font =
    '500 0.875rem ui-sans-serif, system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
  const titleW = ctx.measureText(DRAWER_TITLE).width

  // 左右 px-4 + nav 右侧 pr-2
  const horizontalPad = 32 + 32 + 8
  const raw = Math.max(maxInner, titleW) + horizontalPad
  return Math.min(Math.max(Math.ceil(raw), MIN_PX), maxCap)
}

function useTocDrawerWidth(items: TocItem[]) {
  const [widthPx, setWidthPx] = React.useState(MIN_PX)

  React.useLayoutEffect(() => {
    const update = () => setWidthPx(measureTocDrawerWidthPx(items))
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [items])

  return widthPx
}

export function ArticleTocMobileFab({ items }: { items: TocItem[] }) {
  const [open, setOpen] = React.useState(false)
  const drawerWidthPx = useTocDrawerWidth(items)

  if (items.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        // 贴底固定：在底栏/安全区之上再上抬约三指（3.5rem），避免与系统手势、浏览器工具条打架
        "fixed right-0 top-auto bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-40 lg:hidden",
      )}
    >
      <div className="pr-[max(0.25rem,env(safe-area-inset-right,0px))]">
        <Drawer direction="right" open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex flex-col items-center gap-1 rounded-l-xl border border-r-0 border-border/80 bg-background/95 py-3 pl-2.5 pr-2 shadow-md backdrop-blur-sm",
                "text-foreground transition-colors hover:bg-muted/60 active:bg-muted/80",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
              aria-label="打开文章目录"
            >
              <ListTree className="size-5 shrink-0" aria-hidden />
              <span className="select-none text-[0.6875rem] font-medium leading-none tracking-tight">
                目录
              </span>
            </button>
          </DrawerTrigger>
          <DrawerContent
            className={cn(
              // 覆盖 ui/drawer 默认的 before 卡片层（透明底 + inset 圆角）与遮罩接缝处易出现 1px 亮线；改为整面板实色 + 左侧阴影
              "flex h-dvh max-h-dvh min-h-0 flex-col gap-0 border-0 p-0 outline-none ring-0 ring-offset-0",
              "bg-popover before:hidden",
              "overflow-hidden rounded-l-xl",
              "shadow-[-12px_0_40px_-8px_rgba(0,0,0,0.45)]",
              "pt-[max(0.5rem,env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom,0px)]",
            )}
            style={{ width: drawerWidthPx }}
          >
            <DrawerHeader className="shrink-0 border-b border-border/50 px-4 pb-3 pt-2 text-left">
              <DrawerTitle>{DRAWER_TITLE}</DrawerTitle>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-6 pt-2">
              <ArticleToc items={items} onItemNavigate={() => setOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
