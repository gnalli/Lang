import { allBlogs } from "content-collections"
import { blogsForTag } from "@/lib/blog-tags"

/** 单条专题：标题、摘要与用于统计的标签（需与文章 frontmatter `keywords` 中某项一致） */
export type AiTopic = {
  id: string
  title: string
  description: string
  /** 用于 `blogsForTag` 匹配的标签文案 */
  tag: string
}

/**
 * AI / 专题聚合页展示的栏目顺序与文案。
 * 文章数由全站博文中 `keywords` 包含对应 `tag` 的篇数决定（忽略大小写）。
 */
export const AI_TOPICS: AiTopic[] = [
  {
    id: "ai-tools",
    title: "AI工具集",
    description:
      "收录一些常用的AI工具，方便查阅、复用与对比。",
    tag: "Agent",
  },
]

export function postCountForAiTopic(tag: string): number {
  return blogsForTag(allBlogs, encodeURIComponent(tag)).length
}

export function getAiTopicById(id: string): AiTopic | undefined {
  return AI_TOPICS.find((t) => t.id === id)
}

/** 某专题下的文章，按日期从新到旧 */
export function postsForAiTopic(topic: AiTopic) {
  return blogsForTag(allBlogs, encodeURIComponent(topic.tag)).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}
