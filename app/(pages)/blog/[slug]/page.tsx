import { MDXContent } from "@content-collections/mdx/react"
import { allBlogs } from "content-collections"
import type { Metadata } from "next"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArticleTocSidebar } from "@/components/blog/article-toc-sidebar"
import { ArticleTocMobileFab } from "@/components/blog/article-toc-mobile-fab"
import { BlogPostShell } from "@/components/blog/blog-post-shell"
import { siteConfig } from "@/lib/config"
import { blogArticleProseClassName } from "@/lib/blog-article-prose"
import { parseKeywords } from "@/lib/blog-tags"
import { extractToc } from "@/lib/extract-toc"
import { formatDate } from "@/lib/format-date"
import { cn } from "@/lib/utils"
import Comments from "@/components/comments"
import { PageViewBeacon } from "@/components/analytics/page-view-beacon"
import { getBlogSlugPageViews } from "@/lib/analytics-server"
import { ArticleJsonLd } from "@/components/seo/article-json-ld"
import { ArticleZoomableImage } from "@/components/blog/article-zoomable-image"
import { ArticleFigure } from "@/components/blog/article-code-figure"
import { ArticleLink } from "@/components/blog/article-link"
import { ArticleTable } from "@/components/blog/article-table"
import { ArticleTweet } from "@/components/blog/article-tweet"
import { ArticleGitHubRepo } from "@/components/blog/article-github-repo"

export const dynamicParams = false

/** 与 `getBlogSlugPageViews` 的 unstable_cache 一致；须为字面量以满足 Next 段配置校验 */
export const revalidate = 120

type PageProps = {
    params: Promise<{ slug: string }>
}

function getBlog(slug: string) {
    return allBlogs.find((b) => b.slug === slug) ?? null
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
    const kw = parseKeywords(blog.keywords)
    const keywords = kw.length > 0 ? kw : undefined

    return {
        title: blog.title,
        description,
        keywords,
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
    const currentTags = new Set(parseKeywords(blog.keywords).map((t) => t.toLowerCase()))
    const sameTagBlogs = allBlogs
        .filter((item) => item.slug !== blog.slug)
        .filter((item) => {
            if (currentTags.size === 0) return false
            return parseKeywords(item.keywords).some((tag) =>
                currentTags.has(tag.toLowerCase()),
            )
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
    const pageViews = await getBlogSlugPageViews(slug)

    return (
        <>
            <ArticleJsonLd blog={blog} pageUrl={pageUrl} />
            <div id="blog-post-top" className="pb-4 lg:pb-12">
                <BlogPostShell
                    toc={
                        toc.length > 0 ? (
                            <ArticleTocSidebar
                                key={blog.slug}
                                items={toc}
                                slug={blog.slug}
                            />
                        ) : undefined
                    }
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
                            {pageViews !== null ? (
                                <>
                                    {" "}
                                    · {pageViews.toLocaleString("zh-CN")} 阅读
                                </>
                            ) : null}
                        </p>
                    </header>

                    <div
                        className={cn(
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
                                Tweet: ArticleTweet,
                                GitHubRepo: ArticleGitHubRepo,
                            }}
                        />
                    </div>

                    {prevBlog || nextBlog ? (
                        <nav
                            className="mt-10 grid grid-cols-1 gap-4 py-3 sm:grid-cols-2 sm:gap-6"
                            aria-label="同标签文章导航"
                        >
                            <div className="min-w-0">
                                {prevBlog ? (
                                    <Link
                                        href={`/blog/${prevBlog.slug}`}
                                        className="group inline-flex max-w-full min-w-0 items-center gap-2 text-foreground/90 transition-colors duration-300 hover:text-foreground"
                                    >
                                        <ArrowLeft
                                            className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover:-translate-x-0.5"
                                            aria-hidden
                                        />
                                        <span className="truncate text-base underline decoration-1 underline-offset-4 transition-all duration-300 group-hover:decoration-2 group-hover:underline-offset-6 sm:text-lg">
                                            {prevBlog.title}
                                        </span>
                                    </Link>
                                ) : null}
                            </div>

                            <div className="min-w-0 sm:text-right">
                                {nextBlog ? (
                                    <Link
                                        href={`/blog/${nextBlog.slug}`}
                                        className="group inline-flex max-w-full min-w-0 items-center gap-2 text-foreground/90 transition-colors duration-300 hover:text-foreground max-sm:w-full max-sm:justify-end sm:justify-end"
                                    >
                                        <span className="truncate text-base underline decoration-1 underline-offset-4 transition-all duration-300 group-hover:decoration-2 group-hover:underline-offset-6 sm:text-lg">
                                            {nextBlog.title}
                                        </span>
                                        <ArrowRight
                                            className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                                            aria-hidden
                                        />
                                    </Link>
                                ) : null}
                            </div>
                        </nav>
                    ) : null}

                    <div className="mt-12 w-full min-w-0">
                        <Comments />
                    </div>
                </BlogPostShell>

                {toc.length > 0 ? (
                    <ArticleTocMobileFab key={`${blog.slug}-fab`} items={toc} />
                ) : null}
            </div>

            <PageViewBeacon path={`/blog/${slug}`} slug={slug} />
        </>
    )
}
