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

const sidebarCardClass =
    "border-0 bg-transparent shadow-none ring-0 ring-offset-0 dark:bg-transparent"

const easeOut = [0.25, 0.46, 0.45, 0.94] as const

export type HomeRecommendedItem = {
    slug: string
    title: string
    date: string
    pageViews: number
}

export function HomeSidebarPanels({
    tags,
    recommended,
}: {
    tags: string[]
    recommended: HomeRecommendedItem[]
}) {
    const reduceMotion = useReducedMotion()

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
                        <CardTitle className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-2xl">
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
                        <CardTitle className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-2xl">
                            推荐阅读
                        </CardTitle>
                        <Separator className="my-2" />
                    </CardHeader>
                    <CardContent className="px-0">
                        <ItemGroup className="gap-1" role="list">
                            {recommended.map((blog, index) => (
                                <motion.div
                                    key={blog.slug}
                                    className="min-w-0"
                                    initial={
                                        reduceMotion
                                            ? false
                                            : { opacity: 0, x: 10 }
                                    }
                                    animate={{ opacity: 1, x: 0 }}
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
                                                  x: -2,
                                                  transition: {
                                                      type: "spring",
                                                      stiffness: 380,
                                                      damping: 26,
                                                  },
                                              }
                                    }
                                >
                                    <Item
                                        variant="muted"
                                        size="sm"
                                        className="min-w-0 px-2.5 py-2"
                                        asChild
                                    >
                                        <Link
                                            href={`/blog/${blog.slug}`}
                                            className="min-w-0 no-underline hover:no-underline"
                                        >
                                            <ItemContent className="min-w-0 gap-0">
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
                                            <ItemFooter>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(blog.date)}
                                                </span>
                                                <span className="text-xs text-muted-foreground tabular-nums">
                                                    {blog.pageViews.toLocaleString("zh-CN")}{" "}
                                                    浏览
                                                </span>
                                            </ItemFooter>
                                        </Link>
                                    </Item>
                                </motion.div>
                            ))}
                        </ItemGroup>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    )
}
