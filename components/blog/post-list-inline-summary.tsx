"use client"

import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

const easeOut = [0.25, 0.46, 0.45, 0.94] as const

/** 列表行摘要：触摸端常显（line-clamp）；仅 hover 设备悬停/聚焦时展开 */
export function PostListInlineSummary({
  summary,
  active,
  reduceMotion,
  className,
}: {
  summary?: string | null
  active: boolean
  reduceMotion: boolean | null
  className?: string
}) {
  const text = summary?.trim()
  if (!text) return null

  return (
    <>
      <p
        className={cn(
          "mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground",
          "[@media(hover:hover)_and_(pointer:fine)]:hidden",
          className,
        )}
      >
        {text}
      </p>
      <div className="hidden [@media(hover:hover)_and_(pointer:fine)]:block">
        <AnimatePresence initial={false}>
          {active ? (
            <motion.p
              key="summary"
              initial={reduceMotion ? false : { opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={reduceMotion ? undefined : { opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.32, ease: easeOut }}
              className="overflow-hidden text-sm leading-relaxed text-primary-foreground/80"
            >
              {text}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  )
}
