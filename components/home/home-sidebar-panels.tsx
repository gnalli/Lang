"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemActions, ItemContent, ItemFooter, ItemGroup, ItemTitle } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate } from "@/lib/forma-date"
import { cn } from "@/lib/utils"

const sidebarCardClass =
    "border-0 bg-transparent shadow-none ring-0 ring-offset-0 dark:bg-transparent"

const easeOut = [0.25, 0.46, 0.45, 0.94] as const

export type HomeRecommendedItem = {
    slug: string
    title: string
    date: string
    pageViews: number
}

const cardTitleClass = (variant: "sidebar" | "drawer") =>
    variant === "drawer"
        ? "text-balance text-lg font-semibold tracking-tight text-foreground"
        : "text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-2xl"

export function HomeSidebarPanels({
    tags,
    recommended,
    variant = "sidebar",
}: {
    tags: string[]
    recommended: HomeRecommendedItem[]
    /** drawer：侧栏收进移动端抽屉时略紧凑的标题字号 */
    variant?: "sidebar" | "drawer"
}) {
    const reduceMotion = useReducedMotion()
    const titleCn = cardTitleClass(variant)

    return (
        <>
            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                    reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.48, delay: 0, ease: easeOut }
                }
            >
                <Card className={sidebarCardClass}>
                    <CardHeader className="gap-1.5 p-0">
                        <CardTitle className={titleCn}>
                            博文分类
                        </CardTitle>
                        <Separator className="my-2" />
                    </CardHeader>
                    <CardContent className="px-0">
                        {tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <motion.div
                                        key={tag}
                                        className="inline-flex"
                                        initial={
                                            reduceMotion
                                                ? false
                                                : { opacity: 0, y: 10, scale: 0.96 }
                                        }
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={
                                            reduceMotion
                                                ? { duration: 0 }
                                                : {
                                                      duration: 0.4,
                                                      delay: Math.min(
                                                          index * 0.045,
                                                          0.35,
                                                      ),
                                                      ease: easeOut,
                                                  }
                                        }
                                        whileHover={
                                            reduceMotion
                                                ? undefined
                                                : {
                                                      scale: 1.04,
                                                      transition: {
                                                          type: "spring",
                                                          stiffness: 400,
                                                          damping: 22,
                                                      },
                                                  }
                                        }
                                    >
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 rounded-full px-3 font-normal"
                                            asChild
                                        >
                                            <Link href={`/tag/${encodeURIComponent(tag)}`}>
                                                {tag}
                                            </Link>
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                暂无标签，可在文章 frontmatter 的 keywords 中添加
                            </p>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                    reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.48, delay: 0.06, ease: easeOut }
                }
            >
                <Card className={sidebarCardClass}>
                    <CardHeader className="gap-1.5 p-0">
                        <CardTitle className={titleCn}>
                            推荐阅读
                        </CardTitle>
                        <Separator className="my-2" />
                    </CardHeader>
                    <CardContent className="px-0">
                        <ItemGroup className="gap-3" role="list">
                            {recommended.map((blog, index) => (
                                <motion.div
                                    key={blog.slug}
                                    className="min-w-0 w-full overflow-hidden rounded-lg"
                                    initial={
                                        reduceMotion
                                            ? false
                                            : { opacity: 0, y: 10 }
                                    }
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={
                                        reduceMotion
                                            ? { duration: 0 }
                                            : {
                                                  duration: 0.42,
                                                  delay: Math.min(
                                                      index * 0.055,
                                                      0.45,
                                                  ),
                                                  ease: easeOut,
                                              }
                                    }
                                    whileHover={
                                        reduceMotion
                                            ? undefined
                                            : {
                                                  y: -4,
                                                  transition: {
                                                      type: "spring",
                                                      stiffness: 420,
                                                      damping: 28,
                                                  },
                                              }
                                    }
                                >
                                    <Card className="h-full min-w-0 gap-0 overflow-hidden border-0 bg-muted/50 py-0 shadow-lg ring-0 transition-shadow duration-300 hover:shadow-xl dark:bg-muted/40">
                                        <CardContent className="p-0">
                                            <Item
                                                variant="default"
                                                size="sm"
                                                className={cn(
                                                    "min-w-0 rounded-none border-0 py-0 shadow-none ring-0",
                                                    "hover:bg-muted/40",
                                                )}
                                                asChild
                                            >
                                                <Link
                                                    href={`/blog/${blog.slug}`}
                                                    className="min-w-0 no-underline hover:no-underline"
                                                >
                                                    <ItemContent className="min-w-0 gap-0 px-3 py-2.5">
                                                        <ItemTitle className="w-full min-w-0 max-w-full text-left text-[0.8125rem] font-medium leading-snug text-foreground">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="block truncate">
                                                                        {blog.title}
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent
                                                                    side="right"
                                                                    className="bg-primary"
                                                                >
                                                                    <p>{blog.title}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </ItemTitle>
                                                    </ItemContent>

                                                    <ItemActions>
                                                        <Bookmark className="size-4" />
                                                    </ItemActions>
                                                    <ItemFooter className="px-3 pb-2.5 pt-0">
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(blog.date)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground tabular-nums">
                                                            {blog.pageViews.toLocaleString(
                                                                "zh-CN",
                                                            )}{" "}
                                                            浏览
                                                        </span>
                                                    </ItemFooter>
                                                </Link>
                                            </Item>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </ItemGroup>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    )
}
