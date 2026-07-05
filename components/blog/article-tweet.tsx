import "react-tweet/theme.css"
import { Suspense } from "react"
import { unstable_cache } from "next/cache"
import { EmbeddedTweet, TweetNotFound, TweetSkeleton } from "react-tweet"
import { getTweet as fetchTweet } from "react-tweet/api"
import { cn } from "@/lib/utils"

const getTweet = unstable_cache(
    async (id: string) => fetchTweet(id),
    ["article-tweet"],
    { revalidate: 86400 },
)

async function ArticleTweetContent({ id }: { id: string }) {
    let tweet: Awaited<ReturnType<typeof getTweet>> | null = null
    try {
        tweet = await getTweet(id)
    } catch {
        tweet = null
    }
    if (!tweet) return <TweetNotFound />
    return <EmbeddedTweet tweet={tweet} />
}

type ArticleTweetProps = {
    id: string
}

/** MDX 手写嵌入：<Tweet id="推文 ID" /> */
export function ArticleTweet({ id }: ArticleTweetProps) {
    return (
        <div
            className={cn(
                "article-tweet not-prose my-6 mx-auto w-full max-w-[550px]",
                "[&_.react-tweet-theme]:my-0!",
            )}
        >
            <Suspense fallback={<TweetSkeleton />}>
                <ArticleTweetContent id={id} />
            </Suspense>
        </div>
    )
}
