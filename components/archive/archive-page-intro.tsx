"use client"

import { motion, useReducedMotion } from "motion/react"

const easeOut = [0.25, 0.46, 0.45, 0.94] as const

export function ArchivePageIntro() {
    const reduceMotion = useReducedMotion()

    return (
        <motion.header
            className="mb-10 sm:mb-12"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
                reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.45, ease: easeOut }
            }
        >
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                存档
            </h1>
        </motion.header>
    )
}

export function ArchiveEmptyState() {
    const reduceMotion = useReducedMotion()

    return (
        <motion.p
            className="text-sm text-muted-foreground"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
                reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.4, delay: 0.08, ease: easeOut }
            }
        >
            暂无文章
        </motion.p>
    )
}
