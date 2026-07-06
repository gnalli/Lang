# Lang's Blog — 设计规范

> **版本**：与仓库 `main` 同步维护  
> **适用范围**：`app/`、`components/`、`lib/` 下一切面向用户的 UI  
> **冲突处理**：实现与本文档不一致时，以代码为准，并应回写本文档

本文档描述 Lang's Blog 的视觉语言、布局几何、交互状态与实现约定。面向「改样式、加页面、做 Code Review」场景，强调**可测量的细节**（尺寸、间距、断点、z-index、动效参数），避免 Header 露缝、TOC 错位、列表 hover 不一致等回归。

---

## 目录

1. [设计原则](#1-设计原则)
2. [设计令牌（Design Tokens）](#2-设计令牌design-tokens)
3. [字体与排版](#3-字体与排版)
4. [布局与间距系统](#4-布局与间距系统)
5. [层级（z-index）与表面（Surface）](#5-层级z-index与表面surface)
6. [全局骨架](#6-全局骨架)
7. [Header 与导航](#7-header-与导航)
8. [Footer](#8-footer)
9. [首页 Hero](#9-首页-hero)
10. [文章列表模式（共享）](#10-文章列表模式共享)
11. [博文阅读页](#11-博文阅读页)
12. [目录（TOC）系统](#12-目录toc系统)
13. [分类页与归档](#13-分类页与归档)
14. [404 页面](#14-404-页面)
15. [代码块与 MDX 嵌入](#15-代码块与-mdx-嵌入)
16. [按钮、命令面板与浮层](#16-按钮命令面板与浮层)
17. [动效规范](#17-动效规范)
18. [主题与暗色模式](#18-主题与暗色模式)
19. [无障碍（a11y）](#19-无障碍a11y)
20. [内容模型](#20-内容模型)
21. [工程约定](#21-工程约定)
22. [Giscus 评论区](#22-giscus-评论区)
23. [访问趋势图表](#23-访问趋势图表)
24. [打赏弹层](#24-打赏弹层)
25. [变更检查清单](#25-变更检查清单)

---

## 1. 设计原则

### 1.1 气质

- **编辑感 / 纸质暖色**：浅色底 `#f8f4ee`，墨绿主色 `#364437`，避免纯白 + 纯黑的高对比「默认 IDE」审美。
- **克制装饰**：毛玻璃、细边框、轻阴影；不用大面积渐变按钮或重拟物。
- **长文友好**：行高、锚点偏移、侧栏 TOC、代码可复制、图片可放大、长 URL 不撑破布局。

### 1.2 架构取向

| 原则 | 实践 |
|------|------|
| Server-first | 页面与静态壳用 Server Component；搜索、主题、动效、抽屉为 Client island |
| 单一事实来源 | Header 高度 → `--site-header-height`；导航数据 → `lib/site-nav.ts`；站点元信息 → `lib/config.ts` |
| 列表交互复用 | 首页 / 分类 / 归档共用「日期列 + 标题列 + hover 反色行」模式 |
| 动效可关闭 | 所有 Motion 动画配合 `useReducedMotion`；CSS 动效配合 `motion-reduce:*` |

### 1.3 语言与混排

- 文档语言：`zh-CN`（`app/layout.tsx` → `html lang="zh-CN"`）。
- 英文栏目 + 中文后缀（如 **AI** + 教程）用 `titleParts: { en, zh }` 分 span，英文段 `font-sans` + 微调 `top` 对齐基线（见 `TopicPageShell`）。

---

## 2. 设计令牌（Design Tokens）

定义文件：`app/globals.css`（`:root` / `.dark`）  
消费方式：Tailwind 语义类 + shadcn CSS Variables（`components.json` → `radix-mira`）

### 2.1 浅色模式色板

| 令牌 | Hex / 值 | 语义用途 |
|------|----------|----------|
| `--background` | `#f8f4ee` | 页面底色、Hero 渐变终点 |
| `--foreground` | `#252525` | 正文、标题 |
| `--card` | `#fefefb` | 卡片、代码块外壳 |
| `--popover` | `#fefefb` | 下拉、抽屉面板 |
| `--primary` | `#364437` | 链接色、列表 hover 反色底、Footer 底栏、TOC 高亮 |
| `--primary-foreground` | `#fefefb` | 主色上的文字 |
| `--secondary` | `#f0ebe3` | 次要表面 |
| `--muted` | `#f3ede4` | 代码块背景、行内 code 底 |
| `--muted-foreground` | `#5d6c7b` | 日期、辅助文案、TOC 默认字色 |
| `--accent` | `#ebe4d8` | 悬停浅底（shadcn 默认） |
| `--border` | `#e8e0d4` | 边框、分隔线、列表表头下划线 |
| `--destructive` | `#85181d` | 错误态（少用） |
| `--ring` | `#364437` | focus ring |

### 2.2 深色模式色板

| 令牌 | 值 | 备注 |
|------|-----|------|
| `--background` | `#252525` | |
| `--foreground` | `#f8f4ee` | |
| `--card` / `--popover` | `#2c2e2c` | |
| `--primary` | `#f8f4ee` | 与浅色语义对调：暗色下 primary 为浅字 |
| `--primary-foreground` | `#252525` | |
| `--muted` | `#323432` | |
| `--muted-foreground` | `#a8a89e` | |
| `--border` | `#f8f4ee1a` | 约 10% 透明度描边 |
| `--input` | `#f8f4ee26` | |

### 2.3 圆角

| 令牌 | 计算 | 约等于 |
|------|------|--------|
| `--radius` | 基准 | `0.625rem`（10px） |
| `--radius-sm` | `× 0.6` | 6px |
| `--radius-md` | `× 0.8` | 8px |
| `--radius-lg` | `× 1` | 10px |
| `--radius-xl` | `× 1.4` | 14px |

常用：`rounded-md`（导航头像）、`rounded-lg`（图片）、`rounded-xl`（代码块、打赏弹层）、`rounded-2xl`（404 卡片）。

### 2.4 图表色（Recharts）

`--chart-1` … `--chart-5`：OKLCH 绿色系阶梯，用于访问趋势图（`components/ui/chart.tsx`）。

### 2.5 特殊色（非语义令牌）

| 元素 | 浅色 | 深色 | 文件 |
|------|------|------|------|
| 阅读进度条 | `teal-600` | `teal-400` | `scroll-progress-bar.tsx` |
| Hero 遮罩渐变 | `from-black/15 via-black/5 to-background` | 同结构 | `home-hero.tsx` |
| Hero 兜底色 | `#1e2621`（`HERO_FALLBACK_BG`） | 同 | `home-hero.tsx` |
| Tweet 卡片底 | `#eef7fc` | `#1a2a33` | `globals.css` `.article-tweet` |
| Shiki 代码 | `github-light` / `github-dark` | 随 `html.dark` 切换 | `content-collections.ts` |

### 2.6 透明度用法约定

| 模式 | 示例 | 场景 |
|------|------|------|
| 描边弱化 | `border-border/70`、`border-border/40` | Header nav、下拉菜单 |
| 文字弱化 | `text-foreground/90`、`text-muted-foreground/80` | 元信息、次要说明 |
| 毛玻璃底 | `bg-background/75` + `backdrop-blur-md` | Header 胶囊 |
| 反色行上的字 | `text-primary-foreground/85` | 列表 active 日期列 |

### 2.7 Sticky Header 高度（跨页关键令牌）

```css
/* app/globals.css */
--site-header-height: 4rem;        /* < 640px */
--site-header-height: 4.25rem;   /* ≥ 640px */
```

**估算公式**：外壳 `pt/pb` + 导航 `border` + 导航 `py×2` + 行内容高度 ≈ 当前两档 rem 值。

配套常量：`lib/site-header-offset.ts` → `SITE_HEADER_OFFSET`（禁止在其它文件硬编码 `scroll-mt-20` 等魔法数）。

---

## 3. 字体与排版

### 3.1 字体栈

| 角色 | 字体 | 加载 |
|------|------|------|
| 正文 | 霞鹜文楷（LXGW WenKai）GB2312 子集 | `lib/fonts.ts` → `next/font/local`，WOFF2 自托管 |
| 英文混排标题 | `font-sans`（系统 UI 栈） | 局部用于 AI 等 |
| 代码 | `font-mono` | `pre`、行内 code |

Fallback：`PingFang SC` → `Hiragino Sans GB` → `Microsoft YaHei` → `sans-serif`  
`display: swap`；`html` 挂 `variable`，`body` 挂 `className`。

### 3.2 字号与行高阶梯

| 层级 | 尺寸 | 字重 | 场景 |
|------|------|------|------|
| 站点 Footer 标题 | `text-3xl` → `sm:4xl` → `md:5xl` | `semibold` | Footer 品牌名 |
| 分类页 H1 | `text-4xl` → `sm:5xl` → `md:6xl` | `font-normal` + `font-serif` | Topic 页 |
| 博文页 H1（文前） | `text-3xl` → `sm:[2.125rem]` | `bold` | 文章标题区 |
| 博文 H1（MDX 内） | `1.65rem` → `sm:1.85rem` | `semibold` | prose |
| 博文 H2 | `text-xl` | `semibold` | prose |
| 博文 H3 | `text-lg` | `semibold` | prose |
| 区块标题 | `text-2xl` → `sm:3xl` | `semibold` | 「近期博文」 |
| 列表标题（默认） | `text-base` → `sm:text-lg` | `semibold` | 文章列表行 |
| 列表标题（active） | `text-lg` → `sm:text-xl` | `semibold` | hover 反色行 |
| 正文 | `text-base` → `md:[1.0625rem]` | normal | 博文 MDX 容器 |
| 正文段落 | — | — | `leading-[1.75]` |
| 主导航 | `text-sm` → `sm:text-base` | normal | Header |
| 超窄导航 | `max-[375px]:text-[0.8125rem]` | — | ≤375px |
| 栏目标签 | `text-[0.6875rem]` | `medium` | 列表「日期/标题」表头 |
| TOC 链接 | `text-sm` | normal | `leading-snug` |
| 代码块 | `0.75rem` → `sm:0.8125rem` | mono | `pre` |
| 行内 code | `0.875em` | normal | 相对正文 |

### 3.3 字距（Tracking）

| 场景 | 值 |
|------|-----|
| 大标题 | `tracking-tight` |
| 栏目标签 / Footer 小标题 | `tracking-[0.14em]` ~ `tracking-[0.16em]` + `uppercase` |
| 代码徽章 | `tracking-tight` |

### 3.4 日期格式（`lib/format-date.ts`）

| 函数 | 输出示例 | 用于 |
|------|----------|------|
| `formatDate` | `2026年4月10日` | 博文元信息行 |
| `formatDateList` | `4/10/2026` | 首页、分类列表日期列 |
| `formatDotMonthDay` | `04.10` | 归档列表日期列 |

日期列统一：`text-sm tabular-nums`；active 行用 `text-primary-foreground/85`。

### 3.5 博文正文（Typography）

入口：`blogArticleProseClassName()`（`lib/blog-article-prose.ts`）+ `globals.css` `.article-mdx-prose`。

**必须遵守：**

- 外层：`article-mdx-prose prose prose-neutral dark:prose-invert`
- 标题锚点：`prose-headings:scroll-mt-[var(--site-header-height)]`
- 链接：`prose-a:text-primary`，`underline-offset-4`，hover 略淡
- 引用：`border-l-primary/35`，`text-muted-foreground`
- 图片：`rounded-lg border border-border/70 shadow-sm`，`my-4`
- 表格：全边框 `border-border`，表头 `bg-muted/60`
- 行内 code：**仅** `:not(pre) > code`（`globals.css`），带 `border` + `bg-muted/80`
- 代码块 `pre`：在 `ArticleFigure` 中单独外壳，**不**用 prose 默认 `pre` 样式

---

## 4. 布局与间距系统

### 4.1 页面水平留白

| 层级 | 类名 |
|------|------|
| `layout` main | `px-4 sm:px-6` |
| 首页内容区 | `max-w-6xl mx-auto` |
| 分类 / 404 | `max-w-3xl mx-auto` |
| 归档 | `max-w-3xl` + 页内 `px-4 sm:px-6` |
| Header 居中 | 外层 `px-2` |

### 4.2 垂直节奏

| 场景 | 间距 |
|------|------|
| Footer 上外边距 | `mt-16 sm:mt-20` |
| 页面区块底留白 | `pb-16 sm:pb-20` |
| 首页列表 section | `py-12 sm:py-16 md:py-20` |
| 分类页顶留白 | `pt-8 sm:pt-12` |
| 博文标题区下 | `mb-10` |
| 博文上下篇导航上 | `mt-10` |
| 评论区上 | `mt-12` |
| 列表行（默认） | `py-6 sm:py-7` |
| 列表行（active） | `px-4 py-6 sm:px-5 sm:py-7` |

### 4.3 内容最大宽度

| 宽度 | rem | 用途 |
|------|-----|------|
| `max-w-6xl` | 72 | 首页、Footer、Hero 内容、Header 视觉对齐参考 |
| `max-w-3xl` | 48 | 分类页、404 |
| `54rem` / `max-w-216` | 54 | 博文正文列 |
| `12.5rem` | 12.5 | 博文 TOC 列 |

### 4.4 博文两栏网格

`BlogPostShell`（`lg` 及以上）：

```text
grid-cols-[minmax(0,54rem)_12.5rem]
gap-x-10
pl-12
gap-y-10（单列堆叠时）
```

- 无 TOC 时：正文 `max-w-216 mx-auto`
- TOC 列：`pointer-events-none` 包裹，内部 `pointer-events-auto` 恢复交互
- `< lg`：单列 + `ArticleTocMobileFab`

### 4.5 列表双列网格（首页 / 分类）

```text
grid-cols-[5.5rem_1fr]     → sm: [6.5rem_1fr]
gap-x-4                    → sm: gap-x-6
border-b border-foreground/15
```

归档日期列更窄：`grid-cols-[3.25rem_1fr] sm:[3.5rem_1fr]`。

### 4.6 首页双栏（引言 + 列表）

```text
md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]
md:gap-x-12 lg:gap-x-16 xl:gap-x-20
```

左栏：标题 + 引文 + hover 时标签/字数；右栏：列表。

### 4.7 断点约定

| 断点 | px | 项目内典型变化 |
|------|-----|----------------|
| `max-[375px]` | ≤375 | 导航字号、gap 压缩 |
| `sm` | 640 | Header 高度 4.25rem、Hero 视差、字号升档 |
| `md` | 768 | 首页双栏、引文/列表分列 |
| `lg` | 1024 | 博文 TOC 侧栏、Footer 双列 |
| `xl` | 1280 | 首页列间距加大 |

---

## 5. 层级（z-index）与表面（Surface）

### 5.1 z-index 栈

| z-index | 元素 |
|---------|------|
| `z-60` | 顶部阅读进度条 |
| `z-50` | Sticky Header、「更多」下拉、打赏 QR 弹层 |
| `z-40` | 移动端 TOC FAB |
| `z-30` | 侧栏 TOC `sticky` |
| `-z-1` | TOC 装饰竖线（相对链接） |

### 5.2 表面类型

| 类型 | 配方 | 用于 |
|------|------|------|
| **毛玻璃胶囊** | `bg-background/75 backdrop-blur-md border border-border/70 shadow-sm` + `supports-backdrop-filter:bg-background/65` | Header `nav` |
| **毛玻璃卡片** | `bg-white/18 backdrop-blur-2xl border border-white/25` | Hero 介绍卡 |
| **实色卡片** | `bg-card border border-border shadow-sm` | 代码块、404 内框 |
| **Popover** | `bg-popover/90 backdrop-blur-xl border border-border/70 shadow-md` | 「更多」菜单 |
| **反色行** | `bg-primary text-primary-foreground` | 列表 hover active |
| **Primary 底栏** | `bg-primary text-primary-foreground` | Footer |

### 5.3 阴影

| 元素 | 阴影 |
|------|------|
| Hero 介绍卡 | `shadow-[0_8px_40px_-12px_rgba(0,0,0,0.35)]` |
| 移动 TOC 抽屉 | `shadow-[-12px_0_40px_-8px_rgba(0,0,0,0.45)]`（左侧投影） |
| 打赏弹层 | `shadow-lg` |

---

## 6. 全局骨架

```
┌─ ScrollProgressBar ─ fixed top-0, h-[2px], z-60 ─────────────┐
├─ Header ─ sticky top-0, z-50, 透明背景 ────────────────────┤
├─ main.flex-1.px-4.sm:px-6 ───────────────────────────────────┤
│    └── 各页面内容（自带 max-w / py）                            │
├─ Footer ─ mt-16.sm:mt-20, bg-primary ────────────────────────┤
└─ GoogleAnalytics / ThemeProvider / TooltipProvider ──────────┘
```

- 根：`flex min-h-dvh flex-col`（`app/layout.tsx`）
- `scrollbar-gutter: stable` 防滚动条挤版
- 搜索索引：`layout` `<head>` 内 `prefetch /api/search-index`

---

## 7. Header 与导航

### 7.1 结构树

```text
header.sticky.top-0.z-50
  └── nav[aria-label=主导航]
        ├── Link[首页] → 头像 size-6 sm:size-7, rounded-md
        └── div.flex（链接组）
              ├── SITE_NAV_ITEMS × 4
              └── HeaderNavActions (client)
                    ├── 更多
                    └── 主题切换
```

导航数据：`lib/site-nav.ts` → `SITE_NAV_ITEMS`（AI、运维、随记、归档）。

### 7.2 Header 外壳尺寸

`components/header/index.tsx`：

```text
px-2
pt-1.5 pb-1  →  sm:pt-2 sm:pb-1
flex justify-center
```

### 7.3 导航胶囊 `nav`

```text
mx-auto w-fit max-w-[calc(100vw-1rem)]
flex flex-wrap items-center justify-center
gap-x-4 gap-y-1  →  max-[375px]:gap-x-3  →  sm:gap-x-8
px-2.5 py-1.5    →  max-[375px]:px-2     →  sm:px-5 sm:py-2
border border-border/70
bg-background/75 backdrop-blur-md shadow-sm
supports-backdrop-filter:bg-background/65
```

### 7.4 导航链接样式（规范原文）

主导航、`更多` 按钮、主题切换按钮应共用同一套链接交互（当前实现于 `header-nav.tsx` / `header-more-menu.tsx` / `header-theme-toggle.tsx`）：

```text
text-sm leading-snug text-foreground
transition-[color,transform] duration-200 ease-out
hover:-translate-y-px hover:text-foreground/65
motion-reduce:transition-none motion-reduce:hover:translate-y-0
max-[375px]:text-[0.8125rem] sm:text-base
```

主题切换图标：`size-4`，`strokeWidth={1.75}`；超窄屏 `max-[375px]:scale-90`。

### 7.5 链接组内间距（等距规则）

```text
gap-x-3 max-[375px]:gap-x-2.5 sm:gap-x-5
```

**适用于**：AI / 运维 / 随记 / 归档 / 更多 / 主题切换 — 全部同级视觉节奏。  
`HeaderNavActions` 容器使用**相同** gap，不要用更小的 `gap-x-1`。

### 7.6 「更多」菜单

| 属性 | 值 |
|------|-----|
| 触发 | 精细指针：`pointerenter` 打开 / `pointerleave` 延迟 120ms 关闭；触屏：点击切换 |
| 定位 | Portal 到 `menuGroupRef`；`absolute top-full`；`-right-2.5 sm:-right-5` 抵消 nav 右 padding |
| 面板 | `min-w-28 border border-border/70 bg-popover/90 p-1 shadow-md backdrop-blur-xl` |
| 面板 | `min-w-28 border border-border/70 bg-popover/90 p-1 shadow-md backdrop-blur-xl` |
| 菜单项 | `min-h-9 px-2.5 text-sm gap-1.5`；`hover:bg-foreground/10`；`touch-manipulation` |
| 图标 | Lucide `size-4 opacity-70 strokeWidth={1.75}` |
| 动作 | 搜索 → 命令面板（§16）；访问趋势 → 分析抽屉（§23） |

### 7.7 Server / Client 边界

| Server | Client |
|--------|--------|
| `header/index.tsx` | `header-nav-actions.tsx` |
| `header-nav.tsx` | `header-more-menu.tsx` |
| | `header-theme-toggle.tsx` |
| | `header-command-palette.tsx` |
| | `header-analytics-drawer.tsx`（动态 import） |

---

## 8. Footer

### 8.1 布局

```text
footer.mt-16.sm:mt-20
  └── div.bg-primary.text-primary-foreground
        └── max-w-6xl mx-auto px-4 py-10 sm:px-6 sm:py-12 lg:py-14
              └── lg:grid-cols-[1fr_1fr] gap-10 lg:gap-12 xl:gap-16
```

### 8.2 左侧品牌区

- 标题：`text-3xl sm:4xl md:5xl font-semibold tracking-tight`
- 简介：`text-sm sm:text-base leading-relaxed text-primary-foreground/75`，`max-w-md`
- 社交图标：`gap-4`；GitHub `size-5`，X `size-4`，YouTube `size-5`
- `SOCIAL_LINKS_NAVIGABLE = false` 时为 `<span>` 不可点（装饰）

### 8.3 右侧链接区

三列 `grid-cols-2 sm:grid-cols-3`：

| 列 | 标题样式 | 链接样式 |
|----|----------|----------|
| 导航 | `footerHeading` | `footerLink` |
| Feeds | 同上（Feeds 未 uppercase） | 同上 |
| 联系 | `footerHeading` | 同上 |

```text
footerHeading = text-[0.6875rem] font-medium tracking-[0.16em] text-primary-foreground/55 uppercase
footerLink    = text-sm text-primary-foreground/90 hover:text-primary-foreground
```

链接列表：`mt-4 space-y-2.5`；`prefetch={false}`。

---

## 9. 首页 Hero

文件：`components/home/home-hero.tsx`

### 9.1 区块几何

```text
section: relative left-1/2 w-screen -translate-x-1/2
         mb-10 sm:mb-12
         -mt-[var(--site-header-height)]   /* SITE_HEADER_OFFSET.margin */
         bg-background                      /* HERO_SECTION_BG，防露缝 */
         sm:min-h-[58svh]                   /* 仅桌面视差时 */
```

Hero 可视高度：`h-[min(30rem,52vh)] sm:h-[min(34rem,56vh)]`。

### 9.2 背景图

- 资源：`/images/editorial-hero.jpg`
- `object-cover`；`object-[center_22%] sm:object-[center_18%]`
-  bleed：`top: calc(-1 * var(--site-header-height))`，`bottom: -2rem sm:-2.5rem`
- 桌面视差：`scale: 1.14`，`backgroundY: 0% → 10%`
- 静态（手机）：`scale-110`，无视差

### 9.3 渐变遮罩

`bg-linear-to-b from-black/15 via-black/5 to-background` — 底部必须落到 `background` 令牌。

### 9.4 介绍卡片

```text
max-w-md sm:max-w-lg
border border-white/25 p-7 sm:p-9
bg-white/18 backdrop-blur-2xl supports-backdrop-filter:bg-white/12
shadow-[0_8px_40px_-12px_rgba(0,0,0,0.35)]
```

- 标题：`text-2xl sm:text-3xl font-semibold text-white`
- 副文：`text-base sm:text-lg text-white/90 leading-relaxed`
- 社交：`gap-5`；图标 `text-white/85 hover:text-white`

### 9.5 视差参数（仅 `sm+` 且非 `prefers-reduced-motion`）

| 参数 | 值 |
|------|-----|
| Scroll spring | `stiffness: 38, damping: 26, mass: 1.4, restDelta: 0.0008` |
| 卡片 Y | `18px → -26px`（随滚动） |
| 内容区 padding-top | `pt-[var(--site-header-height)]` |

手机：**禁用** sticky 视差，使用静态 Hero（避免顶底露缝）。

---

## 10. 文章列表模式（共享）

用于：首页近期博文、分类页列表、归档列表。

### 10.1 行结构

```text
li.border-b.border-foreground/15.last:border-b-0
  └── Link.grid.no-underline.transition-colors.duration-300
        ├── time（日期列）
        └── div.min-w-0（标题 + 摘要）
```

### 10.2 Active（hover / focus）状态

```text
默认：py-6 sm:py-7 text-foreground
激活：bg-primary px-4 py-6 sm:px-5 sm:py-7 text-primary-foreground
```

标题字号：默认 `text-base sm:text-lg` → active `text-lg sm:text-xl`。

### 10.3 摘要 `PostListInlineSummary`

| 设备 | 行为 |
|------|------|
| 触屏 / 无 hover | 常显 `line-clamp-2`，`text-muted-foreground` |
| 精细指针 + hover | 默认隐藏；行 active 时 `AnimatePresence` 展开，`text-primary-foreground/80` |

动效：`duration: 0.32`，`ease: [0.25, 0.46, 0.45, 0.94]`。

### 10.4 首页特有

- 展示 10 篇（`DISPLAY_COUNT`）
- 左栏引文 + `PostMeta`（标签 `·` 分隔 + 字数）
- 表头：`text-[0.6875rem] tracking-[0.14em] uppercase text-muted-foreground`

### 10.5 分类页特有

- 标签筛选：`gap-x-4 sm:gap-x-6`；选中 `font-medium text-foreground`，未选 `text-muted-foreground`
- 字数：active 时右上角绝对定位 `text-xs sm:text-sm tabular-nums`
- 分页：每页 15 篇；按钮 `min-h-11 min-w-11 touch-manipulation`

### 10.6 归档特有

- 按年分组 + 「加载更多」（每批 50 篇）
- 日期格式：`formatDotMonthDay`（`04.10`）
- 日期列更窄（见 §4.5）

---

## 11. 博文阅读页

路由：`app/blog/[slug]/page.tsx`

### 11.1 页面结构

```text
#blog-post-top
  └── BlogPostShell
        ├── header（标题区，非 prose）
        ├── div.article-mdx-prose（MDX 正文）
        ├── nav（同标签上下篇，可选）
        └── Comments（mt-12，见 §22 Giscus）
  └── ArticleTocMobileFab（lg 以下，有 TOC 时）
```

### 11.2 标题区

```text
h1: text-3xl sm:[2.125rem] sm:leading-tight font-bold tracking-tight
meta: mt-4 text-sm sm:text-base text-muted-foreground
      格式：{日期} · {字数} 字 · 更新 {日期} · {阅读数} 阅读
```

### 11.3 上下篇导航

```text
mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6
链接：text-foreground/90 hover:text-foreground duration-300
标题：underline decoration-1 underline-offset-4
      hover:decoration-2 hover:underline-offset-6
箭头：group-hover ±translate-x-0.5，duration-300
```

### 11.4 壳层留白

`#blog-post-top`：`pb-4 lg:pb-12`

---

## 12. 目录（TOC）系统

### 12.1 组件关系

```text
ArticleTocSidebar (lg+)
  ├── ArticleTocFumadocs (showHeader)
  └── ArticleTocSidebarActions

ArticleTocMobileFab (<lg)
  └── Drawer → ArticleTocFumadocs (subItemsVisibility: always)

useActiveTocId ← article-toc.tsx（读 --site-header-height）
```

### 12.2 Sticky 偏移

侧栏：`top: calc(var(--site-header-height) + 0.5rem)`（`SITE_HEADER_OFFSET.tocStickyTop`）。

### 12.3 滚动高亮逻辑

- 遍历 heading 元素，`getBoundingClientRect().top <= scrollOffsetPx` 时更新 active
- `scrollOffsetPx` = `readSiteHeaderHeightPx()`，与 CSS `scroll-margin` 同源
- 更新节流：`requestAnimationFrame`

### 12.4 TOC 几何常量

`ARTICLE_TOC_LINE_BASE_PX = 8`

| 层级 | 竖线 x | 文字 padding-left |
|------|--------|-------------------|
| 0 | 8px | 20px（8+12） |
| 1 | 16px | 32px（8+24） |
| ≥2 | 24px | 44px（8+36） |

### 12.5 链接样式

```text
block py-1.5 text-sm leading-snug
text-muted-foreground hover:text-foreground
data-[active=true]:text-primary
transition-colors duration-200
max-h scroll: max-h-[min(40rem,calc(100dvh-7rem))] overflow-y-auto
```

滚动条：`.toc-scroll` 隐藏原生 scrollbar。

### 12.6 活动指示器（SVG）

- 路径描边：`stroke: var(--primary)`，`strokeWidth: 1`
- 圆点：`size-1.5 bg-primary`
- 动画：`duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`；`motion-reduce` 关闭

### 12.7 子标题展开策略

| 场景 | `subItemsVisibility` |
|------|----------------------|
| 桌面侧栏 | `auto`（仅展开当前一级下子标题） |
| 移动抽屉 | `always` |

### 12.8 侧栏操作区

详见 **§24 打赏弹层**；此处为操作区摘要。

分隔线：波浪 SVG `h-2.5 w-20 text-border/80`。

| 按钮 | 图标 | 说明 |
|------|------|------|
| 回到顶部 | `ArrowUp size-3.5` | 滚至 `#blog-post-top` |
| 复制 | `CopyIcon` / `CheckIcon` | 拉取 `/api/blog/[slug]/raw` |
| 打赏 | `Gift size-3.5` | hover 显示双列 QR，`w-[min(21rem,calc(100vw-2rem))]` |

按钮：`Button variant=ghost size=icon-sm`；标签 `text-[0.625rem]` hover 显示。

### 12.9 移动端 FAB + 抽屉

**FAB 位置**：`fixed right-0 top-[50svh] -translate-y-1/2 z-40 lg:hidden`  
（用 `50svh` 而非 `50%`，减轻移动端底栏导致跳动。）

**FAB 按钮**：

```text
h-11 w-10 rounded-l-full rounded-r-none
border border-r-0 border-border/40
bg-background/50 text-muted-foreground/50 backdrop-blur-[3px]
hover: bg-background/75 border-border/55
active: bg-muted/40
pr-[env(safe-area-inset-right)]
```

**抽屉宽度**：按目录文字 canvas 测量，最小 `192px`，最大 `min(88vw, 22rem)`。

**抽屉面板**：`bg-popover`，`rounded-l-xl`，左侧阴影，隐藏默认 `before` 伪层防亮线。

---

## 13. 分类页与归档

### 13.1 分类页壳 `TopicPageShell`

```text
max-w-3xl mx-auto pb-16 pt-8 sm:pb-20 sm:pt-12
header text-center
  Icon: size-5 sm:size-6 strokeWidth=1.5 text-foreground/70
  h1: mt-6 sm:mt-8 font-serif text-4xl sm:5xl md:6xl font-normal
```

配置：`lib/blog-sections.ts` → `BLOG_SECTIONS`（ops / ai / notes）。

### 13.2 标签导航

- 起始：`mt-10`；列表区：`mt-14 sm:mt-18`
- 「全部」+ 各标签，后缀文章数 `text-xs sm:text-sm text-muted-foreground/70`

### 13.3 归档页

```text
max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10
```

按年折叠标题 + `ArchiveListExpandable`（交互同 §10，日期列更窄）。

---

## 14. 404 页面

`app/not-found.tsx`（独立 `main`，包在 layout 的 main 内时注意嵌套 — 当前为完整页面组件）。

### 14.1 高度

```text
h-[calc(100svh-var(--site-header-height)-5rem)]     /* mobile */
sm:h-[calc(100svh-var(--site-header-height)-4.5rem)]
```

实现视口内垂直居中（`flex items-center justify-center`）。

### 14.2 插图卡片

```text
rounded-2xl border border-border/60
bg-black/90 dark:bg-muted
px-4 py-3 sm:px-7 sm:py-5
ring-1 ring-border/30
插图区：h-[min(26svh,11rem)] sm:h-[min(30svh,24rem)]
背景图：/404.png bg-contain
```

### 14.3 文案与按钮

- H1：`text-lg sm:text-3xl font-semibold sm:font-bold`
- 说明：`text-xs sm:text-base text-muted-foreground`
- 按钮：`min-h-11 sm:min-h-9 touch-manipulation`；主按钮 default，次按钮 outline

---

## 15. 代码块与 MDX 嵌入

### 15.1 代码块外壳 `ArticleFigure`

```text
not-prose rounded-xl border border-border bg-card shadow-sm my-4
顶栏：border-b border-border/80 bg-muted/25 dark:bg-muted/15 px-3 py-2
语言徽章：h-5 text-[8px] font-bold rounded-[4px]
pre：px-4 py-3 font-mono text-[0.75rem] sm:text-[0.8125rem] bg-transparent
```

Shiki：双主题 token 色；`html.dark` 切换；子 span **无**独立背景块。

### 15.2 MDX 组件映射

| 组件 | 用途 |
|------|------|
| `ArticleLink` | 外链 / 站内链接 |
| `ArticleZoomableImage` | 点击放大 |
| `ArticleFigure` | 代码块 + 普通 figure |
| `ArticleTable` | 表格滚动包装 |
| `ArticleTweet` | X 嵌入（浅蓝主题） |
| `ArticleGitHubRepo` | 仓库卡片 |

### 15.3 作者约定

- 围栏代码语言标识用小写（`shell`、`typescript`）
- 图片放 `public/images/` 或 CDN；远程图需 `next.config.mjs` `remotePatterns`

---

## 16. 按钮、命令面板与浮层

### 16.1 Button 变体（shadcn）

常用：

| variant | 场景 |
|---------|------|
| `default` | 404 主 CTA、主要操作 |
| `outline` | 次要 CTA |
| `ghost` | TOC 图标按钮 |

常用 size：`default`（404）、`icon-sm`（TOC 操作）。

Focus：`focus-visible:ring-2 focus-visible:ring-ring/30`。

### 16.2 命令面板

- 唤起：`Ctrl+K` / `⌘K`；或「更多 → 搜索」
- 对话框：`sm:max-w-xl`
- 占位符：`支持 Ctrl+K / ⌘K 唤醒，输入关键词搜索标题/内容…`
- 结果上限 8 条；`title` boost ×3，`keywords` boost ×2
- 索引预取：`layout` prefetch + 打开时 `ensureSearchEngine`

### 16.3 Tooltip

全局 `TooltipProvider delayDuration={200}`。

---

## 17. 动效规范

### 17.1 标准缓动

| 名称 | 值 | 用于 |
|------|-----|------|
| `easeOut` | `[0.25, 0.46, 0.45, 0.94]` | 列表摘要、PostMeta |
| `tocEase` | `cubic-bezier(0.22, 1, 0.36, 1)` | TOC 指示器 |
| CSS default | `ease-out` | 导航 color 200ms |

### 17.2 时长

| 时长 | 场景 |
|------|------|
| `150ms` | 阅读进度条 transform |
| `200ms` | 导航 hover、TOC 字色、FAB 状态 |
| `280–320ms` | 列表项入场、摘要展开 |
| `300ms` | 上下篇链接、列表行背景 |

### 17.3 Reduced Motion

- Motion：`useReducedMotion()` → 跳过 initial/exit 或设 `false`
- CSS：`motion-reduce:transition-none`、`motion-safe:*` 前缀
- Hero：减少动效时禁用视差分支

---

## 18. 主题与暗色模式

- 实现：`next-themes`，`attribute="class"`，`defaultTheme="system"`
- **`disableTransitionOnChange`**：切主题时禁止过渡，防闪烁
- 暗色触发：`html.dark`（`@custom-variant dark (&:is(.dark *))`）
- Shiki / Giscus / Tweet 均依赖 `html.dark` 或独立 CSS 变量，新增嵌入时需双主题验证

---

## 19. 无障碍（a11y）

| 项 | 要求 |
|----|------|
| 导航 | `nav[aria-label="主导航"]` |
| 目录 | `nav[aria-label="文章目录"]`；当前项 `aria-current="location"` |
| 主题按钮 | `aria-label` 随模式切换中英文描述 |
| 更多 | `aria-expanded`、`aria-haspopup="menu"`；菜单项 `role="menuitem"` |
| 装饰图 | `alt=""` + `aria-hidden` 或 `role="img" aria-hidden` |
| 触屏目标 | 关键按钮 `min-h-11`；`touch-manipulation` |
| 安全区 | Footer `pb-[env(safe-area-inset-bottom)]`；FAB/抽屉适配 `safe-area-inset-*` |
| 焦点 | 可见 ring，不禁用 outline（`outline-ring/50` 基线） |

---

## 20. 内容模型

目录：`content/blogs/*.md`  
编译：`content-collections.ts`

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✓ | |
| `date` | ✓ | ISO 日期字符串 |
| `updated` | | 展示在元信息行 |
| `category` | | `ops` / `ai` / `notes`，默认 `notes` |
| `summary` | | 列表摘要、OG |
| `keywords` | | 标签；`parseKeywords` 支持 `,，;；|、` |
| `featured` | | schema 存在，**UI 未读取**（遗留字段） |

MDX 管道：`remark-gfm` → `rehypeNormalizeCodeLanguage` → `rehype-pretty-code` → `rehype-slug`。

---

## 21. 工程约定

### 21.1 目录

```text
app/           路由与 API
components/
  header/      顶栏（Server 壳 + Client 岛）
  footer/      页脚（Server）
  home/        首页区块
  blog/        阅读体验（TOC、代码、MDX 组件）
  topic/       分类页
  archive/     归档列表
  seo/         JSON-LD
  ui/          shadcn 基元
lib/
  config.ts           站点元信息、SEO、打赏
  site-nav.ts         导航 / Footer 链接
  site-header-offset.ts
  blog-article-prose.ts
  blog-sections.ts
  blog-tags.ts
  format-date.ts
```

### 21.2 配置入口

| 改什么 | 去哪 |
|--------|------|
| 站名、描述、OG 图 | `lib/config.ts` |
| 导航项 | `lib/site-nav.ts` |
| 栏目文案、primaryTag | `lib/blog-sections.ts` |
| 打赏文案与 QR | `lib/config.ts` → `donate` |
| 全局色板 | `app/globals.css` |
| Header 高度 | `globals.css` + `site-header-offset.ts` + Header 组件 |

### 21.3 组件规则

- 默认 Server Component；仅当需要 hooks / 事件 / 浏览器 API 时加 `"use client"`
- 跨页偏移、prose 类名放 `lib/`，不散落 magic number
- 列表行样式改一处时，**同步检查**首页、分类、归档三处
- 动态重组件：`next/dynamic` + `{ ssr: false }`（分析抽屉）

### 21.4 UI 库

- shadcn preset：`radix-mira`；图标 Lucide
- 新组件：`npx shadcn@latest add <name>`
- 样式入口：`app/globals.css` → `@import "shadcn/tailwind.css"`

---

## 22. Giscus 评论区

文件：`components/comments.tsx`  
挂载：博文页 MDX 正文与上下篇导航之后，`mt-12` 容器内（`app/blog/[slug]/page.tsx`）。

### 22.1 职责与数据源

- 基于 [@giscus/react](https://github.com/giscus/giscus) 嵌入 GitHub Discussions 评论。
- 仓库：`gnalli/Lang`；分类 `General`；`mapping="pathname"`（按路径区分讨论帖）。
- `strict="1"`：仅仓库协作者可新建主贴（访客回复已有讨论）。
- `reactionsEnabled="1"`；`inputPosition="top"`（输入框在顶部）；`lang="zh-CN"`；`loading="lazy"`。

### 22.2 主题与站点同步

Giscus 运行在 iframe 内，**不能**直接读 Tailwind 令牌。站点通过**自托管 CSS 主题 URL** 对齐视觉：

| 模式 | 主题 URL |
|------|----------|
| 浅色 | `{origin}/giscus/site-light.css` |
| 深色 | `{origin}/giscus/site-dark.css` |

实现要点：

1. `useTheme().resolvedTheme` + `useClientMounted()` 决定 `light` / `dark`。
2. 未挂载前渲染占位：`#comments.min-h-48`，`aria-busy="true"`，避免 hydration 闪烁。
3. `<Giscus key={giscusTheme} theme={giscusTheme} />` — URL 变化时整组件重建。
4. `useEffect` 向 iframe `postMessage` 发送 `giscus.setConfig.theme`，切换站点主题时无需刷新页面。

主题 CSS 位于 `public/giscus/`，颜色与 §2 令牌对齐，例如浅色：

| Giscus 变量 | 对应站点 |
|-------------|----------|
| `--color-canvas-default` | `#f8f4ee`（`--background`） |
| `--color-fg-default` | `#252525`（`--foreground`） |
| `--color-btn-primary-bg` | `#364437`（`--primary`） |
| `--color-border-default` | `#e8e0d4`（`--border`） |

暗色主题同理映射 `#252525` / `#f8f4ee` / `#323432` 等。

### 22.3 自定义裁剪（两主题共有）

在 `site-light.css` / `site-dark.css` 末尾：

```css
.gsc-reactions-count { display: none; }   /* 隐藏反应计数 */
.gsc-left-header > em { display: none; }  /* 隐藏左侧说明斜体 */
.gsc-homepage-bg { animation: none; }    /* 关闭加载背景动画 */
```

浅色额外：评论回复区 `border-radius: unset`。暗色额外：评论框边框、分页按钮、textarea 字色修正。

### 22.4 布局与间距

| 属性 | 值 |
|------|-----|
| 容器 id | `comments` |
| 上文间距 | 父级 `mt-12` |
| 占位最小高度 | `min-h-48`（12rem） |
| 宽度 | 随博文正文列（`BlogPostShell` 内 `article`） |

Giscus iframe 宽度 100%，无需额外 `max-w`。

### 22.5 CORS 与安全头

`next.config.mjs` 为 `/giscus/:path*` 单独设置：

```text
Access-Control-Allow-Origin: *
```

以便 `giscus.app` iframe 加载自托管主题 CSS。全站其余路由仍用默认安全头。

### 22.6 改 Giscus 时的检查清单

- [ ] 更新 `public/giscus/site-light.css` **与** `site-dark.css` 成对
- [ ] 主色 / 背景 / 边框与 `globals.css` 一致
- [ ] 切换站点明暗模式后评论区无闪白、按钮不可读
- [ ] 新 Discussions 分类需同步 `category` / `categoryId` props
- [ ] 生产环境 `origin` 能访问 `/giscus/*.css`（勿被 CDN 错误缓存策略挡住）

---

## 23. 访问趋势图表

文件：`components/header/header-analytics-drawer.tsx`  
入口：Header → **更多** → **访问趋势**（`header-more-menu.tsx` 内 `dynamic()` 懒加载，无 SSR）。

数据：`GET /api/analytics/site-trends`（近 14 日 PV / UV；依赖 Supabase，未配置时返回 `ok: false`）。

### 23.1 信息架构

```text
HeaderMoreMenu
  └── HeaderAnalyticsDrawer (bottom Drawer)
        ├── DrawerHeader：标题 + 副标题 + 图例
        ├── ChartPanel：折线图 / 加载 / 错误
        └── DrawerFooter：关闭按钮
```

### 23.2 抽屉外壳（Bottom Sheet）

| 属性 | 类名 / 值 |
|------|-----------|
| 方向 | `direction="bottom"`（Vaul Drawer） |
| 最大高度 | `max-h-[min(92svh,640px)]` |
| 外层 | `max-w-6xl mx-auto`，`bg-transparent`，`before:hidden`（去掉默认把手层） |
| 内面板 | `rounded-t-2xl`，`border border-b-0 border-border/70` |
| 表面 | `bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/88` |
| 顶阴影 | `shadow-[0_-12px_48px_-16px_rgba(0,0,0,0.28)]` |
| 底安全区 | `pb-[env(safe-area-inset-bottom)]` |

### 23.3 标题区

```text
DrawerTitle: text-base font-semibold tracking-tight → 「全站访问趋势」
副标题:      text-xs text-muted-foreground → 「近 14 日 PV / UV」
分隔:        border-b border-border/50
内边距:      px-5 pb-4 pt-2
```

**图例**（`ChartLegend`，非 Recharts 内置 legend）：

| 系列 | 色块 | 数据键 |
|------|------|--------|
| PV | `size-2 rounded-full bg-foreground` | `pv` |
| UV | `size-2 rounded-full bg-muted-foreground` | `uv` |

图例文字：`text-xs text-muted-foreground`，`gap-4`。

### 23.4 图表区 `ChartPanel`

容器配方（与代码块顶栏类似）：

```text
rounded-xl border border-border/60 bg-muted/25 dark:bg-muted/15
px-2 py-2（外层内容区 px-4 py-3 sm:px-5 sm:py-4）
```

**高度**（响应式 clamp，避免小屏顶满屏）：

```text
h-[clamp(9rem,calc(100svh-12rem),16.25rem)] max-h-[45svh] min-h-[9rem]
sm:h-[clamp(10rem,calc(100svh-11rem),17.5rem)] sm:max-h-[50svh]
```

### 23.5 折线图规格（Recharts + shadcn Chart）

`chartConfig`（`satisfies ChartConfig`）：

```ts
pv: { label: "PV", color: "var(--foreground)" }
uv: { label: "UV", color: "var(--muted-foreground)" }
```

| 元素 | 规格 |
|------|------|
| 线条类型 | `type="monotone"` |
| PV 线宽 | `strokeWidth={2}`，色 `var(--color-pv)` |
| UV 线宽 | `strokeWidth={2}`，`strokeOpacity={0.85}` |
| 数据点 | 默认 `dot={false}`；hover `activeDot={{ r: 3, strokeWidth: 0 }}` |
| 网格 | `CartesianGrid vertical={false}`，`stroke: var(--border)`，`strokeOpacity: 0.55` |
| X 轴 | `dataKey="label"`，无刻度线，`tick fontSize: 11`，`fill: var(--muted-foreground)`，`interval="preserveStartEnd"` |
| Y 轴 | `width={32}`，`allowDecimals={false}`，同上 tick 样式 |
| 边距 | `{ left: 0, right: 8, top: 4, bottom: 0 }` |
| Tooltip | `ChartTooltipContent indicator="line"`；cursor 线 `var(--border)` |

### 23.6 状态机

| 状态 | UI |
|------|-----|
| `loading` | 图表区内居中「加载中…」 |
| `ok: false, reason: not_configured` | 「Supabase 连接失败，请检查相关配置…」 |
| `ok: false` 其他 | 「趋势数据暂时无法加载，请稍后重试。」 |
| `ok: true` | 渲染 `LineChart` |

打开抽屉时才 `fetch`；关闭不预取；`open` 变化时取消进行中的请求。

### 23.7 页脚操作

```text
DrawerFooter: flex-row justify-end border-t border-border/50 px-4 py-3 sm:px-5
关闭按钮: Button variant=outline size=sm min-h-10 px-4
```

### 23.8 结构示意图

```text
                    viewport top
                         │
    ┌────────────────────┴────────────────────┐
    │  （半透明遮罩，Vaul 默认）                  │
    │                                           │
    │   ┌─────────────────────────────────┐     │
    │   │ 全站访问趋势          [图例 PV UV] │     │  ← DrawerHeader
    │   │ 近 14 日 PV / UV                  │     │
    │   ├─────────────────────────────────┤     │
    │   │ ┌─────────────────────────────┐ │     │
    │   │ │     ╱‾‾╲    PV (foreground)│ │     │  ← ChartPanel
    │   │ │    ╱    ╲___               │ │     │
    │   │ │   ╱  UV (muted)            │ │     │
    │   │ └─────────────────────────────┘ │     │
    │   ├─────────────────────────────────┤     │
    │   │                        [ 关闭 ] │     │  ← DrawerFooter
    │   └─────────────────────────────────┘     │
    └───────────────────────────────────────────┘
                    safe-area bottom
```

### 23.9 改图表时的检查清单

- [ ] 浅色 / 深色下 PV、UV 线与网格可区分
- [ ] 横屏手机图表高度未超出 `max-h-[45svh]`
- [ ] 未配置 Supabase 时文案友好、不抛客户端异常
- [ ] 图例色块与 `chartConfig` 一致
- [ ] 懒加载包体积：仅「访问趋势」点击后加载 Recharts 相关 chunk

---

## 24. 打赏弹层

文件：`components/blog/article-toc-sidebar-actions.tsx` → `TocDonateButton`  
配置：`lib/config.ts` → `siteConfig.donate`（`message`、`wechatImage`、`alipayImage`）。

仅出现在 **博文页侧栏 TOC 下方**（`lg+` 且有条目时）；移动端 TOC 抽屉**不含**打赏入口。

### 24.1 在侧栏中的位置

```text
ArticleTocSidebar
  ├── ArticleTocFumadocs
  └── ArticleTocSidebarActions
        ├── ArticleTocDivider（波浪线）
        └── flex gap-2
              ├── 回到顶部
              ├── 复制 Markdown
              └── 打赏 ← TocDonateButton
```

操作区：`mt-3`；分隔线上方 `mb-3`；底 `pb-4`。

### 24.2 触发按钮

与其它 TOC 操作按钮一致：

| 属性 | 值 |
|------|-----|
| 组件 | `Button variant="ghost" size="icon-sm"` |
| 图标 | Lucide `Gift`，`size-3.5` |
| 字色 | `text-muted-foreground hover:text-foreground` |
| `aria-label` | `打赏` |
| Hover 标签 | 「好活当赏」，`text-[0.625rem]`，按钮下方 `mt-1`，`opacity 0→1`，`duration-200` |

### 24.3 弹层几何与定位

弹层在按钮**上方**展开（`bottom-full`），避免被正文遮挡。

| 属性 | 值 |
|------|-----|
| 定位 | `absolute bottom-full left-1/2` |
| 水平偏移 | `-translate-x-[calc(50%+1.5rem)]`（略向左偏，对齐 TOC 列视觉中心） |
| 宽度 | `w-[min(21rem,calc(100vw-2rem))]`（最大 336px，两侧留 1rem 呼吸） |
| 与按钮间距 | `pt-2`（弹层下方的透明命中区，便于鼠标移入） |
| z-index | `z-50` |
| 显隐 | 默认 `opacity-0 pointer-events-none`；`group-hover/donate` 时 `opacity-100 pointer-events-auto` |
| 过渡 | `transition-opacity duration-200 ease-out` |

> **注意**：纯 hover 展示，触屏无 hover 时难以唤起；若需移动端打赏，应另设入口（当前刻意仅桌面侧栏）。

### 24.4 弹层卡片

```text
rounded-xl border border-border/70 bg-card shadow-lg
px-4 pt-3 pb-4
```

**文案行**：

```text
text-xs text-left text-muted-foreground mb-3
默认文案：siteConfig.donate.message → 「☕ 请我喝杯咖啡」
```

**双列 QR 网格**：`grid grid-cols-2 gap-2.5`

### 24.5 收款码槽 `DonateQrSlot`

**有图**（`wechatImage` / `alipayImage`，当前为 `/wx.jpg`、`/zfb.jpg`）：

```text
aspect-square w-full rounded-lg border border-border/60 bg-background
Image: fill object-contain p-1 sizes="10rem"
alt: 「微信赞赏码」/「支付宝收款码」
```

**无图占位**：

```text
aspect-square border-dashed border-border/70 bg-muted/25
text-[0.625rem] text-muted-foreground/70
aria-hidden
```

### 24.6 结构示意图（侧栏剖面）

```text
     博文正文列                    TOC 列 (12.5rem)
  ┌──────────────────┐         ┌─────────────────┐
  │                  │         │ 本页目录         │
  │                  │         │  · H2 标题       │
  │                  │         │  · H3 …          │
  │                  │         ├─ ～～波浪分隔～～ ┤
  │                  │         │ [↑] [⎘] [🎁]     │  ← 图标行
  │                  │         │      ┌──────────┴──────────┐
  │                  │         │      │ ☕ 请我喝杯咖啡      │
  │                  │         │      │ ┌────┐    ┌────┐    │
  │                  │         │      │ │微信│    │支付宝│   │
  │                  │         │      │ │ QR │    │ QR │    │
  │                  │         │      │ └────┘    └────┘    │
  │                  │         │      └─────────────────────┘
  │                  │         │           ▲ hover 打赏显示
  └──────────────────┘         └─────────────────┘
```

### 24.7 与其它浮层 z-index 关系

| 层 | z-index | 说明 |
|----|---------|------|
| 打赏弹层 | `z-50` | 与 Header、更多菜单同级 |
| 侧栏 TOC sticky | `z-30` | 低于打赏弹层 |
| 移动 TOC FAB | `z-40` | 不在此功能路径 |

弹层向上展开，通常不与 Header 重叠；若 TOC 贴近视口顶部，注意勿被 `overflow: hidden` 祖先裁剪（当前侧栏 `overflow-visible`）。

### 24.8 配置与变更

| 配置项 | 路径 | 说明 |
|--------|------|------|
| 文案 | `config.donate.message` | 弹层顶部说明 |
| 微信码 | `config.donate.wechatImage` | `public` 下路径 |
| 支付宝码 | `config.donate.alipayImage` | 同上 |

改收款图后替换 `public/wx.jpg`、`public/zfb.jpg` 或更新配置路径即可，无需改组件。

### 24.9 改打赏 UI 时的检查清单

- [ ] 弹层不超出 `calc(100vw - 2rem)`
- [ ] 双码正方形比例一致（`aspect-square`）
- [ ] Hover 时鼠标可从按钮移入弹层不闪烁（依赖 `pt-2` 桥接区）
- [ ] 暗色下 `bg-card` 与 QR 白底对比正常
- [ ] 与「回到顶部」「复制」按钮 `gap-2` 对齐

---

## 25. 变更检查清单

### 25.1 Header / 顶栏

- [ ] `globals.css` `--site-header-height`（两档断点）
- [ ] `lib/site-header-offset.ts` 注释所列文件
- [ ] 首页 Hero 顶部 / 底部无露缝（**手机 + 桌面**）
- [ ] 博文 `scroll-margin`、TOC sticky、404 高度
- [ ] 「更多」菜单右缘与 nav `px-2.5 sm:px-5` 对齐
- [ ] 导航项与主题切换 **等距**（`gap-x-3 sm:gap-x-5`）

### 25.2 列表页

- [ ] 三处列表（首页 / 分类 / 归档）active 行样式一致
- [ ] `PostListInlineSummary` 触屏与桌面表现
- [ ] 日期列宽与 `format-*` 函数匹配

### 25.3 博文 / TOC

- [ ] 侧栏 `lg+` 显示、FAB `<lg` 显示
- [ ] 锚点跳转后标题不被 Header 遮挡
- [ ] 代码块浅色/深色对比度
- [ ] 复制按钮、打赏 hover 弹层不溢出视口

### 25.4 全局色板 / 主题

- [ ] `:root` 与 `.dark` 成对更新
- [ ] Footer `primary` 与正文对比
- [ ] Shiki、Giscus、Tweet 双主题
- [ ] `teal` 进度条在深色下可读

### 25.5 Giscus / 分析 / 打赏

- [ ] `public/giscus/` 双主题与 `globals.css` 同步
- [ ] 评论区切换明暗模式无 iframe 闪白
- [ ] 访问趋势抽屉：未配置 / 加载 / 成功三态 UI 正常
- [ ] 图表 PV/UV 线在深浅色下可辨
- [ ] 打赏 QR 替换后比例与边框正常；hover 桥接区不丢焦点

### 25.6 上线前

- [ ] `npm run typecheck && npm run lint && npm run build`
- [ ] 生产环境勿设 `NEXT_PUBLIC_APP_URL=localhost`
- [ ] 可选 Supabase / `GITHUB_TOKEN` 按 README 配置

---

## 附录 A：有意保持轻量的部分

- Google Analytics ID 写于 `layout.tsx`
- Agentation 仅 `development`
- Footer 社交链接占位（`SOCIAL_LINKS_NAVIGABLE`）
- `featured` frontmatter 未接入 UI
- CDN 域 `cdn.cnlang.net` 于 `next.config.mjs` 白名单

---

## 附录 B：推荐参考文件（读代码时）

| 主题 | 文件 |
|------|------|
| 令牌 | `app/globals.css` |
| Header 偏移 | `lib/site-header-offset.ts` |
| 导航 | `components/header/header-nav.tsx` |
| 列表交互 | `components/home/home-recent-posts.tsx` |
| 正文排版 | `lib/blog-article-prose.ts` |
| 打赏弹层 | `components/blog/article-toc-sidebar-actions.tsx` |
| TOC 目录 | `components/blog/article-toc-fumadocs.tsx` |
| Giscus | `components/comments.tsx`、`public/giscus/*.css` |
| 访问趋势 | `components/header/header-analytics-drawer.tsx` |
| Hero | `components/home/home-hero.tsx` |
| 按钮 | `components/ui/button.tsx` |

---

*文档结束。修改实现后请同步更新对应章节与附录。*
