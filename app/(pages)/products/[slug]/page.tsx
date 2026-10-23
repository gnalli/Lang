import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { siteConfig } from "@/lib/config"

type PageProps = {
  params: Promise<{ slug: string }>
}

/** 只有 moreHref 写成 `/products/<slug>` 才有详情页。站外链接不生成路由。 */
function productSlug(moreHref: string) {
  return /^\/products\/([^/]+)\/?$/.exec(moreHref)?.[1] ?? null
}

function getWork(slug: string) {
  return siteConfig.works.find((work) => productSlug(work.moreHref) === slug) ?? null
}

export const dynamicParams = false

export function generateStaticParams() {
  return siteConfig.works.flatMap((work) => {
    const slug = productSlug(work.moreHref)
    return slug ? [{ slug }] : []
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const work = getWork(slug)
  if (!work) return {}
  return {
    title: work.name,
    description: work.summary,
    alternates: { canonical: `/products/${slug}` },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const work = getWork(slug)
  if (!work) notFound()

  return (
    <div className="mx-auto w-full max-w-3xl pb-20 pt-16 sm:pb-24 sm:pt-20">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        {work.name}
      </h1>
    </div>
  )
}
