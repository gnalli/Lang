import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { BookMarked, Star } from "lucide-react"
import {
    formatGitHubStars,
    getGitHubRepo,
    githubLanguageDotColor,
    parseGitHubRepoProps,
} from "@/lib/github-repo"
import { cn } from "@/lib/utils"

const CARD_SHELL = cn(
    "not-prose my-5 mx-auto block w-full max-w-[480px] rounded-lg border shadow-sm transition-colors",
)

function GitHubRepoSkeleton() {
    return (
        <div
            className={cn(
                CARD_SHELL,
                "animate-pulse border-border bg-muted/30 p-3.5",
            )}
            aria-hidden
        >
            <div className="mb-2.5 h-2.5 w-32 rounded bg-muted" />
            <div className="flex gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-4/5 rounded bg-muted" />
                    <div className="h-2.5 w-16 rounded bg-muted" />
                </div>
                <div className="size-10 shrink-0 rounded-lg bg-muted" />
            </div>
        </div>
    )
}

function GitHubRepoNotFound({ owner, repo }: { owner: string; repo: string }) {
    const url = `https://github.com/${owner}/${repo}`
    return (
        <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                CARD_SHELL,
                "border-border bg-card p-3.5 text-xs text-muted-foreground hover:bg-muted/20",
            )}
        >
            无法加载仓库信息，点击前往 GitHub：{owner}/{repo}
        </Link>
    )
}

async function GitHubRepoCard({ owner, repo }: { owner: string; repo: string }) {
    const data = await getGitHubRepo(owner, repo)
    if (!data) return <GitHubRepoNotFound owner={owner} repo={repo} />

    const languageColor = githubLanguageDotColor(data.language)

    return (
        <Link
            href={data.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                CARD_SHELL,
                "group/github-repo border-border/80 bg-[#f6f8fa] p-3.5",
                "hover:border-border hover:bg-[#eef1f4] dark:border-border dark:bg-card dark:hover:bg-muted/30",
            )}
        >
            <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1 text-[10px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    <BookMarked className="size-3 shrink-0" aria-hidden />
                    <span className="truncate">
                        Repository · {data.fullName}
                    </span>
                </div>
                <div
                    className={cn(
                        "inline-flex shrink-0 items-center gap-0.5 rounded-full border border-amber-200/80 bg-amber-50/90 px-1.5 py-px text-[11px] font-medium text-amber-800",
                        "dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200",
                    )}
                >
                    <Star
                        className="size-2.5 fill-amber-500 text-amber-500"
                        aria-hidden
                    />
                    {formatGitHubStars(data.stargazersCount)}
                </div>
            </div>

            <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold tracking-tight text-foreground group-hover/github-repo:text-primary">
                        {data.name}
                    </h3>
                    {data.description ? (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {data.description}
                        </p>
                    ) : null}
                    {data.language ? (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span
                                className="size-2 shrink-0 rounded-full"
                                style={{ backgroundColor: languageColor }}
                                aria-hidden
                            />
                            {data.language}
                        </div>
                    ) : null}
                </div>
                <Image
                    src={data.ownerAvatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-lg border border-border/60 bg-background object-cover"
                    unoptimized
                />
            </div>
        </Link>
    )
}

type ArticleGitHubRepoProps = {
    owner?: string
    repo?: string
}

/** MDX 手写嵌入：<GitHubRepo owner="org" repo="name" /> */
export function ArticleGitHubRepo(props: ArticleGitHubRepoProps) {
    const parsed = parseGitHubRepoProps(props)
    if (!parsed) return null

    return (
        <Suspense fallback={<GitHubRepoSkeleton />}>
            <GitHubRepoCard owner={parsed.owner} repo={parsed.repo} />
        </Suspense>
    )
}
