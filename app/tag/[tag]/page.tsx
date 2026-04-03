import { allBlogs } from "content-collections"
import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { blogsForTag, uniqueTagsFromBlogs } from "@/lib/blog-tags"
import { siteConfig } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type PageProps = { params: Promise<{ tag: string }> }

export function generateStaticParams() {
    const tags = uniqueTagsFromBlogs(allBlogs)
    return tags.map((tag) => ({ tag }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { tag } = await params
    const label = decodeURIComponent(tag)
    const title = `标签：${label}`
    return {
        title,
        openGraph: {
            title,
            locale: siteConfig.seo.openGraph.locale,
        },
    }
}

export default async function TagPage({ params }: PageProps) {
    const { tag: tagParam } = await params
    const decoded = decodeURIComponent(tagParam)
    const list = blogsForTag(allBlogs, tagParam).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    if (
        list.length === 0 &&
        !uniqueTagsFromBlogs(allBlogs).some((t) => t.toLowerCase() === decoded.toLowerCase())
    ) {
        notFound()
    }

    return (
        <div className="mx-auto w-full max-w-6xl pb-16 pt-6 sm:pb-20 sm:pt-8">
            <header className="mb-10">
                <p className="text-sm text-muted-foreground">
                    <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
                        首页
                    </Link>
                    <span className="mx-2 text-muted-foreground/60">/</span>
                    <span>标签</span>
                </p>
                <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {decoded}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">共 {list.length} 篇文章</p>
            </header>

            <ul
                className={cn(
                    "grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8",
                    "items-stretch",
                )}
            >
                {list.map((blog) => (
                    <li key={blog.slug} className="min-w-0">
                        <Card
                            className={cn(
                                "flex h-full flex-col gap-0 overflow-hidden rounded-xl border-0 bg-card py-0",
                                "shadow-md ring-1 ring-border/50",
                                "transition-shadow duration-200 hover:shadow-lg",
                            )}
                        >
                            <CardHeader className="space-y-0 px-6 pb-3 pt-6 sm:px-8 sm:pb-4 sm:pt-8">
                                <CardTitle className="font-heading text-lg font-semibold leading-snug text-foreground sm:text-xl">
                                    <Link
                                        href={`/blog/${blog.slug}`}
                                        className="text-balance underline-offset-4 transition-colors hover:text-primary hover:underline"
                                    >
                                        {blog.title}
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col px-6 sm:px-8">
                                <p className="text-pretty text-sm leading-relaxed text-muted-foreground line-clamp-5">
                                    {blog.summary?.trim() ? blog.summary : "暂无摘要"}
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto border-t-0 px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
                                <Button variant="ghost" size="sm" className="h-auto gap-1.5 px-0 font-semibold text-foreground" asChild>
                                    <Link href={`/blog/${blog.slug}`}>
                                        阅读更多
                                        <ArrowRight className="size-4" aria-hidden />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </li>
                ))}
            </ul>
        </div>
    )
}
