"use client"

import * as React from "react"
import { LayoutGrid } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  HomeSidebarPanels,
  type HomeRecommendedItem,
} from "@/components/home/home-sidebar-panels"
import { cn } from "@/lib/utils"

export function HomeSidebarMobileFab({
  tags,
  recommended,
}: {
  tags: string[]
  recommended: HomeRecommendedItem[]
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div
      className={cn(
        "fixed right-0 top-[50svh] z-40 -translate-y-1/2 lg:hidden",
      )}
    >
      <div className="pr-[max(0.25rem,env(safe-area-inset-right,0px))]">
        <Drawer direction="right" open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-l-xl border border-r-0 border-border/80 bg-background/95 py-2.5 pl-2.5 pr-2 shadow-md backdrop-blur-sm",
                "text-foreground transition-colors hover:bg-muted/60 active:bg-muted/80",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
              aria-label="打开博文分类与推荐阅读"
            >
              <LayoutGrid className="size-5 shrink-0" aria-hidden />
            </button>
          </DrawerTrigger>
          <DrawerContent
            className={cn(
              "flex h-dvh max-h-dvh min-h-0 flex-col gap-0 border-0 p-0 outline-none ring-0 ring-offset-0",
              "bg-popover before:hidden",
              "overflow-hidden rounded-l-xl",
              "shadow-[-12px_0_40px_-8px_rgba(0,0,0,0.45)]",
              "pt-[max(0.5rem,env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom,0px)]",
              "w-[min(22rem,90vw)]! max-w-[90vw]!",
            )}
          >
            <DrawerHeader className="sr-only">
              <DrawerTitle>博文分类与推荐阅读</DrawerTitle>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-8 pt-3">
              <HomeSidebarPanels
                tags={tags}
                recommended={recommended}
                variant="drawer"
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
