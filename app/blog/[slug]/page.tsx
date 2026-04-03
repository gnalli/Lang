import { MDXContent } from "@content-collections/mdx/react"
import { allBlogs } from "content-collections"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArticleToc } from "@/components/blog/article-toc"
import { FixedTocSlot } from "@/components/blog/fixed-toc-slot"
import { GoToTopButton } from "@/components/blog/go-to-top-button"
import { siteConfig } from "@/lib/config"
import { blogArticleProseClassName } from "@/lib/blog-article-prose"
import { extractToc } from "@/lib/extract-toc"
import { formatDate } from "@/lib/forma-date"
import { cn } from "@/lib/utils"

export const dynamicParams = false

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

    return {
        title: blog.title,
        description: blog.summary ?? siteConfig.site.description,
        keywords: blog.keywords,
        openGraph: {
            title: blog.title,
            description: blog.summary ?? undefined,
            type: "article",
            url,
            locale: siteConfig.seo.openGraph.locale,
            images: siteConfig.site.image
                ? [{ url: siteConfig.site.image }]
                : siteConfig.seo.openGraph.images,
        },
    }
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params
    const blog = getBlog(slug)
    if (!blog) notFound()

    const toc = extractToc(blog.content)

    return (
        <>
            <main id="blog-post-top" className="pb-8 lg:pb-12">
                <div
                    className={cn(
                        "grid items-start",
                        "gap-x-12 lg:gap-x-20 xl:gap-x-28 2xl:gap-x-32",
                        "gap-y-10",
                        "lg:justify-center",
                        toc.length > 0
                            ? "lg:grid-cols-[minmax(0,42rem)_minmax(200px,260px)]"
                            : "lg:grid-cols-1",
                    )}
                >
                    {/* 标题与正文同一 max-w-2xl 列，左缘对齐 */}
                    <div className="min-w-0 w-full max-w-2xl">
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

                        {toc.length > 0 ? (
                            <div className="mb-10 rounded-2xl bg-muted/25 p-4 lg:hidden">
                                <ArticleToc items={toc} />
                            </div>
                        ) : null}

                        <div className={cn("w-full", blogArticleProseClassName())}>
                            <MDXContent code={blog.mdx} />
                        </div>
                    </div>

                    <aside className="hidden w-full min-w-[200px] max-w-[260px] lg:block">
                        {toc.length > 0 ? (
                            <FixedTocSlot footer={<GoToTopButton placement="tocColumn" />}>
                                <ArticleToc items={toc} />
                            </FixedTocSlot>
                        ) : null}
                    </aside>
                </div>
            </main>

            {toc.length > 0 ? (
                <GoToTopButton placement="viewport" className="lg:hidden" />
            ) : (
                <GoToTopButton />
            )}
        </>
    )
}
