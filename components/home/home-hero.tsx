"use client"

import dynamic from "next/dynamic"
import { motion, useReducedMotion } from "motion/react"
import { siteConfig } from "@/lib/config"
import { SITE_HEADER_OFFSET } from "@/lib/site-header-offset"
import { cn } from "@/lib/utils"

const HeroParticles = dynamic(
  () => import("./hero-particles").then((m) => m.HeroParticles),
  { ssr: false },
)

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.05-1.61-4.05-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.48-1.33-5.48-5.92 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.76.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.61-5.49 5.91.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.21.7.82.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z"
      />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  )
}

const iconClass = "text-foreground/60 transition-colors hover:text-foreground"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

function HeroText({ reduceMotion }: { reduceMotion: boolean }) {
  const github = siteConfig.social.github
  const twitter = siteConfig.social.twitter
  const item = (delay: number) =>
    reduceMotion
      ? {}
      : {
        variants: fadeUp,
        initial: "hidden",
        animate: "show",
        transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <div data-hero-text="" className="relative z-10 max-w-md">
      <motion.h1
        {...item(0.2)}
        className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
      >
        Hi there 👋
      </motion.h1>
      <motion.div
        {...item(0.35)}
        className="mt-4 space-y-0.5 text-base leading-relaxed text-foreground/70 sm:mt-5 sm:text-lg"
      >
        <p>Former DevOps Engineer.</p>
        <p>Now an unemployed OPC making AI slop.</p>
      </motion.div>
      <motion.div {...item(0.5)} className="mt-6 flex items-center gap-4 sm:mt-8 sm:gap-5">
        <a
          href={github.url}
          target="_blank"
          rel="noopener noreferrer"
          className={iconClass}
          aria-label="GitHub"
        >
          <GitHubIcon className="size-5" />
        </a>
        <a
          href={twitter.url}
          target="_blank"
          rel="noopener noreferrer"
          className={iconClass}
          aria-label="X"
        >
          <XIcon className="size-4" />
        </a>
      </motion.div>
    </div>
  )
}

function ScrollCue() {
  return (
    <a
      href="#recent-posts-heading"
      className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-foreground/70 transition-colors hover:text-foreground sm:bottom-10"
      aria-label="滚动到最新文章"
    >
      <span>Scroll</span>
      <span className="relative block h-9 w-px overflow-hidden bg-foreground/20">
        <span className="absolute inset-x-0 top-0 h-1/2 animate-[hero-scroll-cue_1.8s_ease-in-out_infinite] bg-foreground/70 motion-reduce:animate-none" />
      </span>
    </a>
  )
}

export function HomeHero() {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section
      data-home-hero
      className={cn(
        "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-background text-foreground",
        SITE_HEADER_OFFSET.margin,
        SITE_HEADER_OFFSET.heroHeight,
      )}
      aria-label="介绍"
    >
      <div className="absolute inset-0 mask-[linear-gradient(to_bottom,black_78%,transparent)]">
        <HeroParticles reduceMotion={reduceMotion} />
      </div>
      <div
        data-hero-content=""
        className={cn(
          "pointer-events-none relative mx-auto flex h-full w-full max-w-6xl items-end px-4 pb-32 sm:items-center sm:px-6 sm:pb-10 [&_a]:pointer-events-auto",
          SITE_HEADER_OFFSET.padding,
        )}
      >
        <HeroText reduceMotion={reduceMotion} />
      </div>
      <ScrollCue />
    </section>
  )
}
