/** 同访客、同页短时间内重复打开不计新 PV，减少刷屏与免费档写入量 */
export const PAGE_VIEW_DEBOUNCE_MINUTES = 30

/** 服务端统计读库缓存（与首页 `export const revalidate` 保持一致） */
export const ANALYTICS_CACHE_REVALIDATE_SECONDS = 120
