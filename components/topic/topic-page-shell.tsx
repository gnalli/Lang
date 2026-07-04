import type { LucideIcon } from "lucide-react"
import { TopicPageContent } from "@/components/topic/topic-page-content"
import type { TagCount } from "@/lib/blog-tags"
import type { TopicPostItem } from "@/lib/blog-sections"

type TopicPageShellProps = {
  icon: LucideIcon
  title: string
  titleParts?: { en: string; zh: string }
  posts: TopicPostItem[]
  tags: TagCount[]
}

function TopicPageTitle({
  title,
  titleParts,
}: {
  title: string
  titleParts?: { en: string; zh: string }
}) {
  if (!titleParts) return title

  return (
    <span className="inline-flex items-baseline justify-center gap-x-[0.35em]">
      <span className="relative top-[0.06em] font-sans text-[0.94em] tracking-tight sm:text-[0.96em]">
        {titleParts.en}
      </span>
      <span>{titleParts.zh}</span>
    </span>
  )
}

export function TopicPageShell({
  icon: Icon,
  title,
  titleParts,
  posts,
  tags,
}: TopicPageShellProps) {
  return (
    <div className="mx-auto w-full max-w-3xl pb-16 pt-8 sm:pb-20 sm:pt-12">
      <header className="text-center">
        <Icon
          className="mx-auto size-5 text-foreground/70 sm:size-6"
          strokeWidth={1.5}
          aria-hidden
        />
        <h1 className="mt-6 font-serif text-4xl font-normal tracking-tight text-foreground sm:mt-8 sm:text-5xl md:text-6xl">
          <TopicPageTitle title={title} titleParts={titleParts} />
        </h1>
      </header>

      <TopicPageContent posts={posts} tags={tags} />
    </div>
  )
}
