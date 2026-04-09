import { defineCollection, defineConfig } from "@content-collections/core"
import { compileMDX } from "@content-collections/mdx"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import wordCount from "word-count"
import { z } from "zod"

const blogs = defineCollection({
  name: "blogs",
  directory: "content/blogs",
  include: "**/*.md",
  parser: "frontmatter",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    updated: z.string().optional(),
    featured: z.boolean().optional().default(false),
    summary: z.string().optional(),
    keywords: z.string().optional(),
    content: z.string(),
  }),
  transform: async (post, context) => {
    const mdx = await compileMDX(context, post, {
      cwd: process.cwd(),
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: {
              light: "github-light",
              dark: "github-dark",
            },
            bypassInlineCode: true,
            grid: false,
            keepBackground: false,
          },
        ],
        rehypeSlug,
      ],
    })
    return {
      ...post,
      slug: post._meta.path,
      wordCount: wordCount(post.content),
      mdx,
    }
  },
})

export default defineConfig({
  content: [blogs],
})
