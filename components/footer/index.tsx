import Link from "next/link"
import { siteAuthors, siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"

const link = cn(
    "text-sm text-muted-foreground underline-offset-4 transition-colors",
    "hover:text-foreground hover:underline",
)

export default function FooterActions() {
    const year = new Date().getFullYear()
    const author = siteAuthors()[0]
    const github = siteConfig.social.github
    const name = author?.name ?? "Lang"

    return (
        <footer className="border-t border-border/60 px-4 py-8 sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
                {author?.url ? (
                    <Link href={author.url} prefetch={false} className={link}>Author</Link>
                ) : (
                    <span className="text-foreground/85">Author</span>
                )}
                <span aria-hidden className="text-border select-none">
                    ·
                </span>
                <Link href="/rss.xml" prefetch={false} className={link}>
                    RSS
                </Link>
                <span aria-hidden className="text-border select-none">
                    ·
                </span>
                <Link href="/atom.xml" prefetch={false} className={link}>
                    Atom
                </Link>
                <span aria-hidden className="text-border select-none">
                    ·
                </span>
                <a
                    href={github.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={link}
                >
                    GitHub
                </a>
            </div>
            <p className="mx-auto mt-4 max-w-6xl text-center text-xs text-muted-foreground">
                © {year} {name}‘s Blog Powered by Nextjs & React & Shadcn
            </p>
        </footer>
    )
}
