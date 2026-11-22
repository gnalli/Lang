"use client"

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { useReducedMotion } from "motion/react"
import { siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"

const subscribeToMount = () => () => {}

function WorkImageLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  const className =
    "relative block aspect-[4/3] overflow-hidden rounded-2xl outline-none transition-transform duration-200 ease-linear focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background motion-reduce:transition-none"
  if (/^https?:\/\//.test(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        data-depth="48"
        className={className}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href} aria-label={label} data-depth="48" className={className}>
      {children}
    </Link>
  )
}

export function WorkBand() {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribeToMount, () => true, () => false)
  const works = siteConfig.works
  const reduce = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [entered, setEntered] = useState(false)
  const enteredRef = useRef(false)
  const tiltAngles = useRef({ x: 0, y: 0 })
  const work = works[active] ?? works[0]

  const applyTilt = (clientX: number, clientY: number) => {
    const node = tiltRef.current
    if (!node) return
    if (reduce || !enteredRef.current) {
      node.style.transform = "rotateX(0deg) rotateY(0deg)"
      return
    }
    const { left, top, width, height } = node.getBoundingClientRect()
    const x = Math.min(12, Math.max(-12, (clientX - left - width / 2) / 25))
    const y = Math.min(12, Math.max(-12, (clientY - top - height / 2) / 25))
    tiltAngles.current = { x, y }
    node.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`
  }

  const select = (index: number, clientX: number, clientY: number) => {
    const image = tiltRef.current
    if (!image) return
    enteredRef.current = true
    setActive(index)
    setEntered(true)
    if (clientX !== 0 || clientY !== 0) applyTilt(clientX, clientY)
  }

  const leave = () => {
    enteredRef.current = false
    tiltAngles.current = { x: 0, y: 0 }
    setEntered(false)
    if (tiltRef.current) tiltRef.current.style.transform = "rotateX(0deg) rotateY(0deg)"
  }

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const apply = () => {
      const tilt = tiltRef.current
      if (!tilt) return
      const pop = entered && reduce === false
      if (!pop) tilt.style.transform = "rotateX(0deg) rotateY(0deg)"
      else {
        const { x, y } = tiltAngles.current
        tilt.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`
      }
      for (const el of tilt.querySelectorAll<HTMLElement>("[data-depth]")) {
        const z = pop ? (el.dataset.depth ?? "0") : "0"
        el.style.transform = `translateZ(${z}px)`
      }
    }
    apply()
  }, [entered, active, reduce])

  const tilt = (event: React.MouseEvent<HTMLDivElement>) => {
    applyTilt(event.clientX, event.clientY)
  }

  if (!work) return null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6 md:min-h-svh">
      <div
        ref={rootRef}
        className="grid flex-1 content-start items-start gap-y-4 md:min-h-svh md:content-stretch md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-x-12 lg:gap-x-16 xl:gap-x-20"
        onMouseMove={tilt}
        onMouseLeave={leave}
        onBlur={(event) => {
          const next = event.relatedTarget
          if (next instanceof Node && event.currentTarget.contains(next)) return
          leave()
        }}
      >
        <div className="pt-14 sm:pt-16">
          <h2
            id="home-works-heading"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            作品
          </h2>
          <ul className="mt-4 sm:mt-8">
            {works.map((item, index) => {
              const on = entered && active === index
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={(event) =>
                      select(index, event.clientX, event.clientY)
                    }
                    onFocus={() => select(index, 0, 0)}
                    className="block origin-left py-5 no-underline outline-none transition-transform duration-200 ease-out hover:translate-y-px hover:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 sm:py-6"
                  >
                    <h3
                      className={cn(
                        "text-2xl font-semibold tracking-tight transition-colors duration-200 sm:text-3xl",
                        on ? "text-background" : "text-background/75",
                      )}
                    >
                      {item.name}
                    </h3>
                    <p className="mt-1 max-w-md text-sm leading-relaxed text-background/70 sm:text-base">
                      {item.summary}
                    </p>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="relative w-full pb-10 md:self-stretch md:pb-0">
          <div
            className="relative w-full md:absolute md:top-[28%] md:right-0 md:ml-auto md:w-[78%]"
            style={{ perspective: "1000px" }}
            onMouseEnter={(event) => {
              const image = tiltRef.current
              if (!image) return
              enteredRef.current = true
              setEntered(true)
              applyTilt(event.clientX, event.clientY)
            }}
          >
            <div
              ref={tiltRef}
              className="relative transition-transform duration-200 ease-linear motion-reduce:transition-none"
              style={{ transformStyle: "preserve-3d" }}
            >
              <WorkImageLink href={work.moreHref} label={`${work.name} 的截图`}>
                {mounted && (resolvedTheme === "light" || resolvedTheme === "dark") && (
                  <Image
                    src={work.image[resolvedTheme]}
                    alt=""
                    fill
                    sizes="(min-width: 1152px) 490px, (min-width: 768px) calc(47vw - 48px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                    className="object-cover"
                  />
                )}
              </WorkImageLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
