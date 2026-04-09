"use client"

import { ExternalLink, Rss } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"
import Link from "next/link"

const iconBtn =
  "size-10 rounded-xl text-foreground/85 hover:bg-accent sm:size-11 [&_svg]:size-[1.15rem] sm:[&_svg]:size-5"

function feedBase(): string {
  return siteConfig.seo.metadataBase.origin.replace(/\/$/, "")
}

export function HeaderRssMenu() {
  const base = feedBase()
  const rssUrl = `${base}/rss.xml`
  const atomUrl = `${base}/atom.xml`

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(iconBtn, "max-[560px]:hidden")}
          aria-label="RSS 与 Atom 订阅"
        >
          <Rss />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-20">
        <DropdownMenuLabel className="font-normal text-muted-foreground text-xs">
          订阅更新
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={rssUrl} target="_blank" rel="noopener noreferrer" className="flex cursor-pointer items-center gap-2">
            <ExternalLink className="size-3.5 shrink-0 opacity-70" />
            <span className="flex-1">RSS</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={atomUrl} target="_blank" rel="noopener noreferrer" className="flex cursor-pointer items-center gap-2">
            <ExternalLink className="size-3.5 shrink-0 opacity-70" />
            <span className="flex-1">Atom</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
