import { allBlogs } from "content-collections"
import { NextResponse } from "next/server"

type RouteContext = {
    params: Promise<{ slug: string }>
}

export async function GET(_request: Request, context: RouteContext) {
    const { slug } = await context.params
    const blog = allBlogs.find((item) => item.slug === slug)
    if (!blog) {
        return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(blog.content, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
    })
}
