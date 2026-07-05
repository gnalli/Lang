import { unstable_cache } from "next/cache"

type GitHubRepoData = {
    name: string
    fullName: string
    description: string | null
    htmlUrl: string
    stargazersCount: number
    language: string | null
    ownerLogin: string
    ownerAvatarUrl: string
}

type GitHubApiRepo = {
    name: string
    full_name: string
    description: string | null
    html_url: string
    stargazers_count: number
    language: string | null
    owner: {
        login: string
        avatar_url: string
    }
}

async function fetchGitHubRepo(owner: string, repo: string): Promise<GitHubRepoData | null> {
    const headers: HeadersInit = {
        Accept: "application/vnd.github+json",
        "User-Agent": "Lang-Blog",
    }
    const token = process.env.GITHUB_TOKEN?.trim()
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers,
        next: { revalidate: 86400 },
    })

    if (!res.ok) return null

    const data = (await res.json()) as GitHubApiRepo
    return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        htmlUrl: data.html_url,
        stargazersCount: data.stargazers_count,
        language: data.language,
        ownerLogin: data.owner.login,
        ownerAvatarUrl: data.owner.avatar_url,
    }
}

export const getGitHubRepo = unstable_cache(
    async (owner: string, repo: string) => fetchGitHubRepo(owner, repo),
    ["github-repo"],
    { revalidate: 86400 },
)

export function parseGitHubRepoProps(props: {
    owner?: string
    repo?: string
}): { owner: string; repo: string } | null {
    const owner = props.owner?.trim()
    const repo = props.repo?.trim()
    if (!owner || !repo) return null
    return { owner, repo }
}

export function formatGitHubStars(count: number): string {
    if (count >= 1_000_000) {
        const value = count / 1_000_000
        return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, "")}M`
    }
    if (count >= 1_000) {
        const value = count / 1_000
        return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, "")}k`
    }
    return count.toLocaleString("en-US")
}

/** GitHub Linguist 主语言色点 */
const LANGUAGE_DOT: Record<string, string> = {
    typescript: "#3178C6",
    javascript: "#F7DF1E",
    python: "#3572A5",
    go: "#00ADD8",
    rust: "#DEA584",
    java: "#B07219",
    kotlin: "#A97BFF",
    swift: "#F05138",
    ruby: "#701516",
    php: "#4F5D95",
    csharp: "#178600",
    cpp: "#F34B7D",
    c: "#555555",
    shell: "#89E051",
    html: "#E34C26",
    css: "#663399",
    vue: "#41B883",
    dart: "#00B4AB",
    elixir: "#6E4A7E",
    hcl: "#844FBA",
    dockerfile: "#384D54",
}

export function githubLanguageDotColor(language: string | null): string {
    if (!language) return "#8b949e"
    return LANGUAGE_DOT[language.toLowerCase()] ?? "#8b949e"
}
