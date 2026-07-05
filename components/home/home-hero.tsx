"use client"

import Image from "next/image"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import * as React from "react"
import { siteConfig } from "@/lib/config"
import { SITE_HEADER_OFFSET } from "@/lib/site-header-offset"
import { cn } from "@/lib/utils"

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

function TwitchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0 1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"
      />
    </svg>
  )
}

const iconClass =
  "text-white/85 transition-colors hover:text-white"

/** 额外滚动行程：视差在更长距离内完成，动效更缓 */
const PARALLAX_SCROLL = "min-h-[52svh] sm:min-h-[58svh]"

/** 滚动进度弹簧：低刚度 + 较大质量，跟随更慢、更顺滑（仅用于前景卡片） */
const SCROLL_SPRING = { stiffness: 38, damping: 26, mass: 1.4, restDelta: 0.0008 }

/** 背景层额外向上延伸，避免视差/弹簧滞后时在顶部露缝 */
const HERO_BG_BLEED = "-top-[10%] h-[120%]"

export function HomeHero() {
  const github = siteConfig.social.github
  const sectionRef = React.useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const smoothProgress = useSpring(scrollYProgress, SCROLL_SPRING)

  /** 背景须与 scroll 同步；若走 spring，快速回顶时会滞后下移并露出顶部间隙 */
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-8%", "12%"])
  const cardY = useTransform(smoothProgress, [0, 1], [18, -26])

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative left-1/2 mb-10 w-screen max-w-[100vw] -translate-x-1/2 sm:mb-12",
        SITE_HEADER_OFFSET.margin,
        PARALLAX_SCROLL,
      )}
      aria-label="介绍"
    >
      <div
        className={cn(
          "sticky top-0 overflow-hidden",
          SITE_HEADER_OFFSET.heroHeight,
        )}
      >
        <motion.div
          className={cn(
            "absolute inset-x-0 origin-center will-change-transform",
            HERO_BG_BLEED,
          )}
          style={reduceMotion ? undefined : { y: backgroundY, scale: 1.12 }}
          aria-hidden
        >
          <Image
            src="/images/editorial-hero.jpg"
            alt=""
            fill
            className="object-cover object-top"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/15 via-black/5 to-background/90" />
        </motion.div>

        <div
          className={cn(
            "relative z-10 mx-auto flex h-full w-full max-w-6xl items-center px-4 pb-8 sm:px-6 sm:pb-10",
            SITE_HEADER_OFFSET.padding,
          )}
        >
          <motion.div
            className={cn(
              "w-full max-w-md border border-white/25 p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.35)] sm:max-w-lg sm:p-9",
              "bg-white/18 backdrop-blur-2xl supports-backdrop-filter:bg-white/12",
            )}
            style={reduceMotion ? undefined : { y: cardY }}
          >
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Hi, I&apos;m Lang 👋
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/90 sm:text-lg">
              Former DevOps Engineer.
            </p>
            <p className="mt-1 text-base leading-relaxed text-white/90 sm:text-lg">
              Now building AI Agents, one prompt at a time.
            </p>

            <div className="mt-7 flex items-center gap-5">
              <a
                href={github.url}
                target="_blank"
                rel="noopener noreferrer"
                className={iconClass}
                aria-label="GitHub"
              >
                <GitHubIcon className="size-5" />
              </a>
              <span className={iconClass} aria-hidden>
                <TwitchIcon className="size-5" />
              </span>
              <span className={iconClass} aria-hidden>
                <XIcon className="size-4" />
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
