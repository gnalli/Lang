import { unstable_cache } from "next/cache"
import { buildSearchIndexExport } from "@/lib/build-search-index"

const getCachedSearchIndex = unstable_cache(
    async () => buildSearchIndexExport(),
    ["blog-search-index"],
    { revalidate: 3600 },
)

export async function GET() {
    const index =
        process.env.NODE_ENV === "development"
            ? buildSearchIndexExport()
            : await getCachedSearchIndex()

    return Response.json(
        { index },
        {
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        },
    )
}
