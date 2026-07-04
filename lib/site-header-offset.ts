/** Sticky Header 占位高度，供 Hero 负 margin / 内边距与顶栏对齐（含导航边框与 min-h-11 触控区） */
export const SITE_HEADER_OFFSET = {
  margin: "-mt-[4.75rem] sm:-mt-[5.25rem]",
  padding: "pt-[4.75rem] sm:pt-[5.25rem]",
  heroHeight: "h-[min(30rem,52vh)] sm:h-[min(34rem,56vh)]",
} as const
