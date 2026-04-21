import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AI_TOPICS,
  getAiTopicById,
  postsForAiTopic,
} from "@/lib/ai-topics"
import { siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"

type PageProps = { params: Promise<{ topicId: string }> }

export function generateStaticParams() {
  return AI_TOPICS.map((t) => ({ topicId: t.id }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topicId } = await params
  const topic = getAiTopicById(topicId)
  if (!topic) {
    return { title: "专题" }
  }
  const title = topic.title
  const description = topic.description
  const canonical = new URL(`/ai/${topicId}`, siteConfig.seo.metadataBase).toString()
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      locale: siteConfig.seo.openGraph.locale,
      siteName: siteConfig.seo.openGraph.siteName,
      images: siteConfig.seo.openGraph.images,
    },
  }
}

export const revalidate = 120

export default async function AiTopicDetailPage({ params }: PageProps) {
  const { topicId } = await params
  const topic = getAiTopicById(topicId)
  if (!topic) {
    notFound()
  }

  const posts = postsForAiTopic(topic)

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-3xl pb-20 pt-6 sm:pt-8",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-size-[20px_20px] before:opacity-[0.35] before:dark:opacity-25",
        "before:bg-[radial-gradient(circle,rgba(0,0,0,0.08)_1px,transparent_1px)]",
        "dark:before:bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)]",
      )}
    >
      <nav className="mb-8">
        <Link
          href="/ai"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          返回专题列表
        </Link>
      </nav>

      <header className="border-b border-border pb-8 sm:pb-10">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {topic.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {topic.description}
        </p>
      </header>

      <section
        className="pt-8 sm:pt-10"
        aria-labelledby="topic-article-list-heading"
      >
        <h2
          id="topic-article-list-heading"
          className="mb-6 text-sm font-medium text-muted-foreground"
        >
          文章列表 · {posts.length} 篇
        </h2>

        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            暂无带标签「{topic.tag}」的文章。在文章 frontmatter 的{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">keywords</code>{" "}
            中加入该标签后即可在此展示。
          </p>
        ) : (
          <ol className="list-none space-y-0 p-0">
            {posts.map((post, index) => {
              const n = String(index + 1).padStart(2, "0")
              const summary =
                post.summary?.trim() ||
                `共 ${post.wordCount} 字 · 点击查看全文`
              return (
                <li
                  key={post.slug}
                  className="border-b border-border/60 last:border-b-0"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    aria-label={post.title}
                    className={cn(
                      "group flex gap-4 pb-10 pt-1 no-underline sm:gap-6 sm:pb-12",
                      "-mx-2 flex-row rounded-lg px-2 outline-none transition-colors",
                      "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    )}
                  >
                    <span
                      className="w-10 shrink-0 pt-0.5 text-right font-serif text-sm tabular-nums text-muted-foreground sm:w-11 sm:text-base"
                      aria-hidden
                    >
                      {n}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-xl">
                        {post.title}
                      </span>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                        {summary}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
