import { allBlogs } from "content-collections"
import Link from "next/link"
import { RecentPostsExpandable } from "@/components/home/recent-posts-expandable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemActions, ItemContent, ItemFooter, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { uniqueTagsFromBlogs } from "@/lib/blog-tags"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowRightIcon, Book, BookAIcon, BookDashed, Bookmark, BookMarked, BookMarkedIcon, ExternalLinkIcon, MarsStroke, MoveRightIcon } from "lucide-react"
import { formatDate } from "@/lib/forma-date"

const sidebarCardClass =
  "border-0 bg-transparent shadow-none ring-0 ring-offset-0 dark:bg-transparent"

export default function HomePage() {
  const sorted = [...allBlogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const recentItems = sorted.map((b) => ({
    slug: b.slug,
    title: b.title,
    date: b.date,
    wordCount: b.wordCount,
    summary: b.summary ?? null,
  }))
  const tags = uniqueTagsFromBlogs(allBlogs)

  /** 推荐阅读：暂以精选优先，否则取最新几篇；接入阅读量后改为按 PV 排序 */
  const featuredFirst = sorted.filter((b) => b.featured)
  const recommended =
    featuredFirst.length > 0 ? featuredFirst.slice(0, 7) : sorted.slice(0, 7)

  return (
    <div className="mx-auto w-full max-w-6xl pb-16 pt-6 sm:pb-20 sm:pt-8">
      <div
        className={cn(
          "grid items-start",
          "gap-x-12 lg:gap-x-20 xl:gap-x-28 2xl:gap-x-32",
          "gap-y-10 lg:gap-y-0",
          "lg:grid-cols-[minmax(0,42rem)_minmax(200px,260px)]",
          "lg:justify-center",
        )}
      >
        <div className="min-w-0 w-full max-w-2xl lg:max-w-none">
          <header className="mb-8">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              近期博文
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">按发布时间倒序</p>
          </header>

          <RecentPostsExpandable posts={recentItems} />
        </div>

        <aside className="min-w-0 w-full lg:sticky lg:top-24 lg:max-w-[260px] lg:justify-self-end">
          <div className="flex flex-col gap-8">
            <Card className={sidebarCardClass}>
              <CardHeader className="gap-1.5 p-0">
                <CardTitle className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-2xl">博文分类</CardTitle>
                {/* <CardDescription>来自各篇 keywords，点击查看同标签文章</CardDescription> */}
                <Separator className="my-2" />
              </CardHeader>
              <CardContent className="px-0">
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Button
                        key={tag}
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-full px-3 font-normal"
                        asChild
                      >
                        <Link href={`/tag/${encodeURIComponent(tag)}`}>{tag}</Link>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    暂无标签，可在文章 frontmatter 的 keywords 中添加
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className={sidebarCardClass}>
              <CardHeader className="gap-1.5 p-0">
                <CardTitle className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-2xl">推荐阅读</CardTitle>
                <Separator className="my-2" />
                {/* <CardDescription>热门文章（接入阅读量后将按浏览排序）</CardDescription> */}
              </CardHeader>
              <CardContent className="px-0">
                <ItemGroup className="gap-1" role="list">
                  {recommended.map((blog) => (
                    <Item
                      key={blog.slug}
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
                            {/* <span className="block truncate">{blog.title}</span> */}
                            <Tooltip >
                              <TooltipTrigger asChild>
                                <span className="block truncate">{blog.title}</span>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-primary">
                                <p>{blog.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </ItemTitle>
                        </ItemContent>

                        <ItemActions>
                          <Bookmark className="size-4" />
                        </ItemActions>
                        <ItemFooter>
                          <span className="text-xs text-muted-foreground">{formatDate(blog.date)}</span>
                          {blog.wordCount > 0 && <span className="text-xs text-muted-foreground">{blog.wordCount} 字</span>}
                        </ItemFooter>
                      </Link>
                    </Item>
                  ))}
                </ItemGroup>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}
