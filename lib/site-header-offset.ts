/**
 * Sticky Header 占位与 scroll 偏移。
 *
 * 须与 `app/globals.css` 的 `--site-header-height` 保持一致；改 Header 高度时请同步：
 * 1. `app/globals.css` → `--site-header-height`（mobile / sm 两档）
 * 2. `components/header/index.tsx` → 外壳 `pt-*` / `pb-*`
 * 3. `components/header/header-nav.tsx` → 导航 `py-*`、`min-h-9`、头像尺寸
 *
 * 估算：外壳 padding + 导航 border + 导航 py×2 + 行高（min-h-9）≈ 当前 4rem / 4.25rem
 */
export const SITE_HEADER_OFFSET = {
  margin: "-mt-[var(--site-header-height)]",
  padding: "pt-[var(--site-header-height)]",
  /** Hero 背景层向上下延伸，避免顶/底露兜底色 */
  bgExtend:
    "top-[calc(-1*var(--site-header-height))] -bottom-8 sm:-bottom-10",
  heroHeight: "h-[min(24rem,44vh)] sm:h-[min(34rem,56vh)]",
  /** 正文标题锚点 scroll-margin，与顶栏 sticky 对齐 */
  headingScrollMargin: "prose-headings:scroll-mt-[var(--site-header-height)]",
  /** 侧栏 TOC sticky：顶栏高度 + 半行间距，避免贴边 */
  tocStickyTop: "top-[calc(var(--site-header-height)+0.5rem)]",
  /**
   * 404 主区高度：视口 − 顶栏 − layout 上下留白（main pt + 底部呼吸）
   * mobile 留白 5rem / sm 4.5rem，与改 Header 前视觉接近
   */
  notFoundMainHeight:
    "min-h-0 h-[calc(100svh-var(--site-header-height)-5rem)] max-h-[calc(100svh-var(--site-header-height)-5rem)] sm:h-[calc(100svh-var(--site-header-height)-4.5rem)] sm:max-h-[calc(100svh-var(--site-header-height)-4.5rem)]",
} as const

/** 读取 `--site-header-height` 的像素值（TOC 滚动高亮等客户端逻辑） */
export function readSiteHeaderHeightPx(): number {
  if (typeof window === "undefined") return 64

  const root = document.documentElement
  const raw = getComputedStyle(root).getPropertyValue("--site-header-height").trim()
  if (!raw) return 64

  if (raw.endsWith("rem")) {
    const rem = Number.parseFloat(raw)
    const fontSize = Number.parseFloat(getComputedStyle(root).fontSize)
    return rem * fontSize
  }

  if (raw.endsWith("px")) {
    return Number.parseFloat(raw)
  }

  return 64
}
