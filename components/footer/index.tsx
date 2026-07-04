"use client"

import * as React from "react"
import Link from "next/link"
import { siteConfig } from "@/lib/config"
import {
  SITE_FOOTER_CONTACT,
  SITE_FOOTER_LEGAL,
  SITE_FOOTER_SITEMAP,
} from "@/lib/site-nav"
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

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>
  )
}

/** 设为 true 后，社交图标在新标签页打开 config 中的外链 */
const SOCIAL_LINKS_NAVIGABLE = false

const socialLinkClass =
  "text-primary-foreground/90 transition-colors hover:text-primary-foreground"

function SocialAnchor({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={socialLinkClass}
      aria-label={label}
      onClick={SOCIAL_LINKS_NAVIGABLE ? undefined : (event) => event.preventDefault()}
    >
      {children}
    </a>
  )
}

const footerLink = cn(
  "text-sm text-primary-foreground/90 transition-colors hover:text-primary-foreground",
)

const footerHeading = "text-[0.6875rem] font-medium tracking-[0.16em] text-primary-foreground/55 uppercase"

export default function FooterActions() {
  const { github, twitter, youtube } = siteConfig.social

  return (
    <footer className="mt-16 sm:mt-20">
      <div className="w-full bg-primary pb-[env(safe-area-inset-bottom,0px)] text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
            <div className="space-y-6">
              <p className="text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
                {siteConfig.site.title.default}
              </p>
              <p className="max-w-md text-sm leading-relaxed text-primary-foreground/75 sm:text-base">
                专注AI应用与运维实践，分享AI工具、教程。
              </p>

              <div className="flex items-center gap-4">
                <SocialAnchor href={github.url} label="GitHub">
                  <GitHubIcon className="size-5" />
                </SocialAnchor>
                <SocialAnchor href={twitter.url} label="X">
                  <XIcon className="size-4" />
                </SocialAnchor>
                <SocialAnchor href={youtube.url} label="YouTube">
                  <YouTubeIcon className="size-5" />
                </SocialAnchor>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6 lg:justify-self-end lg:max-w-lg xl:max-w-xl">
              <div>
                <p className={footerHeading}>导航</p>
                <ul className="mt-4 space-y-2.5">
                  {SITE_FOOTER_SITEMAP.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} prefetch={false} className={footerLink}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[0.6875rem] font-medium tracking-[0.16em] text-primary-foreground/55">
                  Feeds
                </p>
                <ul className="mt-4 space-y-2.5">
                  {SITE_FOOTER_LEGAL.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} prefetch={false} className={footerLink}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className={footerHeading}>联系</p>
                <ul className="mt-4 space-y-2.5">
                  {SITE_FOOTER_CONTACT.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} prefetch={false} className={footerLink}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
