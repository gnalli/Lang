"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"

export function HeaderBrand() {
    return (
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
            <Link
                href="/"
                className="inline-flex shrink-0 items-center justify-center rounded-xl p-0.5 text-foreground/90 transition hover:bg-accent/70"
                aria-label="首页"
            >
                <div className="relative size-11 overflow-hidden rounded-full ring-2 ring-border/60 sm:size-12">
                    <Image src="/avatar.png" alt="" fill className="object-cover" sizes="48px" priority />
                </div>
            </Link>
            <motion.div
                initial={{ x: -8, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <Link
                    href="/"
                    className="text-base font-semibold tracking-tight text-foreground sm:text-lg max-[420px]:hidden"
                >
                    Lang&apos;s Blog
                </Link>
            </motion.div>
        </div>
    )
}
