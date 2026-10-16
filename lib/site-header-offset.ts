/**
 * Sticky Header 占位与 scroll 偏移。
 *
 * 顶栏外壳（`components/header/header-surface.tsx`）直接用 `h-(--site-header-height)`，
 * 改高度只需改 `app/globals.css` 的 `--site-header-height`（mobile / sm 两档），
 * 并确认 `header-nav.tsx` 的头像与主题按钮仍能放下。
 */
export const SITE_HEADER_OFFSET = {
  margin: "-mt-[var(--site-header-height)]",
  padding: "pt-[var(--site-header-height)]",
  /** 首页 Hero 铺满视口。section 用负 margin 顶到视口上沿；矮视口兜底 30rem。 */
  heroHeight: "h-svh min-h-[30rem]",
  /** 正文标题锚点 scroll-margin，与顶栏 sticky 对齐 */
  headingScrollMargin: "prose-headings:scroll-mt-[var(--site-header-height)]",
  /** 页内锚点（首页栏目、作品），避开 sticky 顶栏 */
  anchorScrollMargin: "scroll-mt-[var(--site-header-height)]",
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
