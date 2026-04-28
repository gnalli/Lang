import { MDXContent } from "@content-collections/mdx/react"
import { allBlogs } from "content-collections"
import type { Metadata } from "next"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArticleToc } from "@/components/blog/article-toc"
import { ArticleTocMobileFab } from "@/components/blog/article-toc-mobile-fab"
import { siteConfig } from "@/lib/config"
import { blogArticleProseClassName } from "@/lib/blog-article-prose"
import { extractToc } from "@/lib/extract-toc"
import { formatDate } from "@/lib/forma-date"
import { cn } from "@/lib/utils"
import Comments from "@/components/comments"
import { PageViewBeacon } from "@/components/analytics/page-view-beacon"
import { ArticleJsonLd } from "@/components/seo/article-json-ld"
import { ArticleZoomableImage } from "@/components/blog/article-zoomable-image"
import { ArticleFigure } from "@/components/blog/article-code-figure"
import { ArticleLink } from "@/components/blog/article-link"
import { ArticleTable } from "@/components/blog/article-table"

export const dynamicParams = false

type PageProps = {
    params: Promise<{ slug: string }>
}

function getBlog(slug: string) {
    return allBlogs.find((b) => b.slug === slug) ?? null
}

function parseKeywordsToTags(keywords?: string) {
    if (!keywords) return []
    return keywords
        .split(/[,，;；、|]/)
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
}

export function generateStaticParams() {
    return allBlogs.map((blog) => ({ slug: blog.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const blog = getBlog(slug)
    if (!blog) return {}

    const url = new URL(`/blog/${blog.slug}`, siteConfig.seo.metadataBase).toString()
    const description = blog.summary?.trim() || siteConfig.site.description
    const ogImages = siteConfig.site.image
        ? [{ url: siteConfig.site.image }]
        : siteConfig.seo.openGraph.images
    const kw = blog.keywords
        ? blog.keywords.split(/[,，;；]/).map((s) => s.trim()).filter(Boolean)
        : undefined

    return {
        title: blog.title,
        description,
        keywords: kw,
        alternates: { canonical: url },
        openGraph: {
            title: blog.title,
            description: blog.summary?.trim() || undefined,
            type: "article",
            url,
            locale: siteConfig.seo.openGraph.locale,
            siteName: siteConfig.seo.openGraph.siteName,
            publishedTime: new Date(blog.date).toISOString(),
            modifiedTime: new Date(blog.updated ?? blog.date).toISOString(),
            authors: [siteConfig.site.author.name],
            images: ogImages,
        },
    }
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params
    const blog = getBlog(slug)
    if (!blog) notFound()

    const toc = extractToc(blog.content)
    const currentTags = new Set(parseKeywordsToTags(blog.keywords))
    const sameTagBlogs = allBlogs
        .filter((item) => item.slug !== blog.slug)
        .filter((item) => {
            if (currentTags.size === 0) return false
            const tags = parseKeywordsToTags(item.keywords)
            return tags.some((tag) => currentTags.has(tag))
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const timeline = [...sameTagBlogs, blog].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    const currentIndex = timeline.findIndex((item) => item.slug === blog.slug)
    const prevBlog = currentIndex > 0 ? timeline[currentIndex - 1] : null
    const nextBlog = currentIndex >= 0 && currentIndex < timeline.length - 1
        ? timeline[currentIndex + 1]
        : null
    const pageUrl = new URL(`/blog/${blog.slug}`, siteConfig.seo.metadataBase).toString()

    return (
        <>
            <ArticleJsonLd blog={blog} pageUrl={pageUrl} />
            <main id="blog-post-top" className="pb-4 lg:pb-12">
                <div
                    className={cn(
                        "grid items-start lg:items-stretch",
                        "gap-x-12 lg:gap-x-20 xl:gap-x-28 2xl:gap-x-32",
                        "gap-y-10",
                        "lg:justify-center",
                        toc.length > 0
                            ? "lg:grid-cols-[minmax(0,42rem)_minmax(200px,260px)]"
                            : "lg:grid-cols-1",
                    )}
                >
                    {/* 默认 max-w-2xl；770–1020px 间正文列占满可用宽度（平板横屏等），其余视口不变 */}
                    <div
                        className={cn(
                            "min-h-0 min-w-0 w-full max-w-2xl",
                            "[@media(min-width:770px)_and_(max-width:1020px)]:max-w-none",
                        )}
                    >
                        <header className="mb-10">
                            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-[2.125rem] sm:leading-tight">
                                {blog.title}
                            </h1>
                            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                                {formatDate(blog.date)} · {blog.wordCount} 字
                                {blog.updated ? (
                                    <>
                                        {" "}
                                        · 更新 {formatDate(blog.updated)}
                                    </>
                                ) : null}
                            </p>
                        </header>

                        <div
                            className={cn(
                                // 博文字体大小；min-w-0 + overflow-x-clip 防止 ul>li 中长链接撑出横向滚动
                                "w-full min-w-0 max-w-full overflow-x-clip text-base md:text-[1.0625rem]",
                                blogArticleProseClassName(),
                            )}
                        >
                            <MDXContent
                                code={blog.mdx}
                                components={{
                                    a: ArticleLink,
                                    img: ArticleZoomableImage,
                                    figure: ArticleFigure,
                                    table: ArticleTable,
                                }}
                            />
                        </div>

                        {prevBlog || nextBlog ? (
                            <nav
                                className="mt-10 flex items-center justify-between py-3"
                                aria-label="同标签文章导航"
                            >
                                <div className="min-w-0">
                                    {prevBlog ? (
                                        <Link
                                            href={`/blog/${prevBlog.slug}`}
                                            className="group inline-flex min-w-0 items-center gap-2 text-foreground/90 transition-colors duration-300 hover:text-foreground"
                                        >
                                            <span className="rounded-full bg-muted/70 p-1.5 transition-transform duration-300 ease-out group-hover:-translate-x-0.5 group-hover:bg-muted">
                                                <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
                                            </span>
                                            <span className="truncate text-lg underline decoration-1 underline-offset-4 transition-all duration-300 group-hover:decoration-2 group-hover:underline-offset-6">
                                                {prevBlog.title}
                                            </span>
                                        </Link>
                                    ) : null}
                                </div>

                                <div className="min-w-0 text-right">
                                    {nextBlog ? (
                                        <Link
                                            href={`/blog/${nextBlog.slug}`}
                                            className="group inline-flex min-w-0 items-center gap-2 text-foreground/90 transition-colors duration-300 hover:text-foreground"
                                        >
                                            <span className="truncate text-lg underline decoration-1 underline-offset-4 transition-all duration-300 group-hover:decoration-2 group-hover:underline-offset-6">
                                                {nextBlog.title}
                                            </span>
                                            <span className="rounded-full bg-muted/70 p-1.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:bg-muted">
                                                <ArrowRight className="size-3.5 shrink-0" aria-hidden />
                                            </span>
                                        </Link>
                                    ) : null}
                                </div>
                            </nav>
                        ) : null}

                        <div className="mt-12 w-full min-w-0">
                            <Comments />
                        </div>
                    </div>

                    <aside
                        className={cn(
                            "hidden w-full min-w-[200px] max-w-[260px]",
                            "lg:z-20 lg:block lg:h-full lg:min-h-0 lg:self-stretch",
                        )}
                    >
                        {toc.length > 0 ? (
                            <div className="relative min-h-0 lg:h-full">
                                <div
                                    className={cn(
                                        "lg:sticky lg:top-24 lg:z-20",
                                        // 目录区域限制高度（避免占满整屏）；仅溢出时出现滚动条
                                        "lg:max-h-[min(40rem,calc(100dvh-6rem))] lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-y-contain lg:pr-1",
                                        "border-t-40 border-transparent bg-clip-padding"
                                    )}
                                >
                                    <ArticleToc key={blog.slug} items={toc} />
                                </div>
                            </div>
                        ) : null}
                    </aside>
                </div>

                {toc.length > 0 ? (
                    <ArticleTocMobileFab key={blog.slug} items={toc} />
                ) : null}
            </main>

            <PageViewBeacon path={`/blog/${slug}`} slug={slug} />
        </>
    )
}
