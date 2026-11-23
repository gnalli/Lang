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
9. [首页 Hero 与 Particle Scroll](#9-首页-hero-与-particle-scroll)
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
20. [Giscus 评论区](#20-giscus-评论区)
21. [打赏弹层](#21-打赏弹层)
22. [变更检查清单](#22-变更检查清单)

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
| `--background` | `#f8f4ee` | 页面底色 |
| `--foreground` | `#252525` | 正文、标题 |
| `--card` | `#fefefb` | 卡片、代码块外壳 |
| `--popover` | `#fefefb` | 下拉、抽屉面板 |
| `--primary` | `#364437` | 链接色、列表 hover 反色底、TOC 高亮 |
| `--primary-foreground` | `#fefefb` | 主色上的文字 |
| `--secondary` | `#f0ebe3` | 次要表面 |
| `--muted` | `#f3ede4` | 代码块背景、行内 code 底 |
| `--muted-foreground` | `#5d6c7b` | 日期、辅助文案、TOC 默认字色 |
| `--accent` | `#ebe4d8` | 悬停浅底（shadcn 默认） |
| `--border` | `#e8e0d4` | 边框、分隔线、列表表头下划线 |
| `--destructive` | `#85181d` | 错误态（少用） |
| `--ring` | `#364437` | focus ring |
| `--footer` | `var(--background)`（`#f8f4ee`） | 首页页脚，与上方作品块相反 |

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
| `--footer` | `var(--background)`（`#252525`） | 首页页脚，与上方作品块相反 |

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
| Hero 粒子 | `--hero-petal` + `--hero-pollen` 点缀（运行时读取） | 同，配色随主题切换 | `hero-particles.tsx` |
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
--site-header-height: 3.25rem;     /* < 640px */
--site-header-height: 3.5rem;      /* ≥ 640px */
```

顶栏外壳直接用 `h-(--site-header-height)`，改高度只改这一处。

配套常量：`lib/site-header-offset.ts` → `SITE_HEADER_OFFSET`（禁止在其它文件硬编码 `scroll-mt-20` 等魔法数）。

---

## 3. 字体与排版

### 3.1 字体栈

| 角色 | 字体 | 加载 |
|------|------|------|
| 正文 | 霞鹜文楷（LXGW WenKai）GB2312 子集 | `app/fonts/wenkai/faces.css` + `public/fonts/wenkai/*.woff2`，按 unicode-range 自托管加载，首屏预加载 `interface.woff2` |
| 英文混排标题 | `font-sans`（系统 UI 栈） | 局部用于 AI 等 |
| 代码 | `font-mono` | `pre`、行内 code |

Fallback：`Site Wenkai Fallback`（度量对齐）→ `PingFang SC` → `Hiragino Sans GB` → `Microsoft YaHei` → `sans-serif`  
正文使用 `font-display: swap`，并在 `app/layout.tsx` 预加载首屏分片 `/fonts/wenkai/interface.woff2`，`next.config.mjs` 为 `/fonts/*` 设置一年不可变缓存。首页文字共用一个小分片，其余字符按文章使用频率分片。需重新划分时，在生产构建后用 fonttools 和 brotli 执行 `scripts/subset-wenkai.py`。

### 3.2 字号与行高阶梯

| 层级 | 尺寸 | 字重 | 场景 |
|------|------|------|------|
| 站点 Footer 标题 | `text-3xl` → `sm:4xl` → `md:5xl` | `semibold` | Footer 品牌名 |
| 分类页 H1 | `text-4xl` → `sm:5xl` → `md:6xl` | `font-normal` + `font-serif` | Topic 页 |
| 博文页 H1（文前） | `text-3xl` → `sm:[2.125rem]` | `bold` | 文章标题区 |
| 博文 H1（MDX 内） | `1.65rem` → `sm:1.85rem` | `semibold` | prose |
| 博文 H2 | `text-xl` | `semibold` | prose |
| 博文 H3 | `text-lg` | `semibold` | prose |
| 区块标题 | `text-2xl` → `sm:3xl` | `semibold` | 「近期文章」 |
| 列表标题（默认） | `text-base` → `sm:text-lg` | `semibold` | 文章列表行 |
| 列表标题（active） | `text-lg` → `sm:text-xl` | `semibold` | hover 反色行 |
| 正文 | `text-base` → `md:[1.0625rem]` | normal | 博文 MDX 容器 |
| 正文段落 | — | — | `leading-[1.75]` |
| 主导航 | `text-base` | normal | Header 链接 |
| 超窄导航 | `max-[375px]:text-sm` | — | ≤375px |
| 顶栏品牌 | `text-lg` | `semibold` | 「Lang.」，≥420px |
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
| 首页近期文章 | 破出 `main` 的水平留白后，与顶栏同一套 `max-w-6xl mx-auto px-4 sm:px-6`，左缘对齐头像，右缘对齐主题按钮 |
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
gap-y-10（单列堆叠时）
```

外层破出 `main` 的水平留白，用和顶栏相同的 `max-w-6xl mx-auto px-4 sm:px-6`。正文列左缘对齐头像。

- 无 TOC 时：正文 `max-w-216`，左缘与有目录时的正文列相同
- TOC 列：`pointer-events-none` 包裹，内部 `pointer-events-auto` 恢复交互
- `< lg`：单列 + `ArticleTocMobileFab`

### 4.5 列表双列网格（首页 / 分类）

```text
grid-cols-[5.5rem_1fr]     → sm: [6.5rem_1fr]
gap-x-4                    → sm: gap-x-6
首页近期文章手机端更窄：`4.75rem` / `gap-x-3`，`sm` 起与上面相同
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
| `sm` | 640 | Header 高度 3.5rem、Hero 粒子布局切换、字号升档 |
| `md` | 768 | 首页双栏、引文/列表分列 |
| `lg` | 1024 | 博文 TOC 侧栏、Footer 双列 |
| `xl` | 1280 | 首页列间距加大 |

---

## 5. 层级（z-index）与表面（Surface）

### 5.1 z-index 栈

| z-index | 元素 |
|---------|------|
| `z-60` | 顶部阅读进度条 |
| `z-50` | Sticky Header、打赏 QR 弹层 |
| `z-40` | 移动端 TOC FAB |
| `z-30` | 侧栏 TOC `sticky` |
| `-z-1` | TOC 装饰竖线（相对链接） |

### 5.2 表面类型

| 类型 | 配方 | 用于 |
|------|------|------|
| **首页顶栏** | 滚动后跟下方区块同色实底，无边框。其它页面才用毛玻璃 | Header |
| **实色卡片** | `bg-card border border-border shadow-sm` | 代码块、404 内框 |
| **Popover** | `bg-popover/90 backdrop-blur-xl border border-border/70 shadow-md` | 浮层底 |
| **反色行** | `bg-primary text-primary-foreground` | 列表 hover active |
| **页脚** | 首页始终与上方作品块相反：作品 `bg-foreground`，页脚 `bg-background`（亮色 `#f8f4ee`、暗色 `#252525`）。内页亮色 `#252525`、暗色 `#f8f4ee`（`data-footer="page"`），文字用对侧色 | Footer |

### 5.3 阴影

| 元素 | 阴影 |
|------|------|
| 移动 TOC 抽屉 | `shadow-[-12px_0_40px_-8px_rgba(0,0,0,0.45)]`（左侧投影） |
| 打赏弹层 | `shadow-lg` |

---

## 6. 全局骨架

```
┌─ ScrollProgressBar ─ fixed top-0, h-[2px], z-60 ─────────────┐
├─ Header ─ sticky top-0, z-50, 透明背景 ────────────────────┤
├─ main.flex-1.px-4.sm:px-6 ───────────────────────────────────┤
│    └── 各页面内容（自带 max-w / py）                            │
├─ Footer ─ mt-16.sm:mt-20, bg-footer ───────────────────────────┤
└─ GoogleAnalytics / ThemeProvider / TooltipProvider ──────────┘
```

- 根：`flex min-h-dvh flex-col`（`app/layout.tsx`）
- `scrollbar-gutter: stable` 防滚动条挤版
- 搜索索引：鼠标移入搜索按钮或键盘聚焦时预热，触屏打开时加载

---

## 7. Header 与导航

### 7.1 结构树

```text
HeaderSurface (client) → header.sticky.top-0.z-50.h-(--site-header-height)
  └── nav[aria-label=主导航]  mx-auto h-full max-w-6xl px-4 sm:px-6 justify-between
        ├── Link[首页] → 头像 size-7 sm:size-8 rounded-md ring-1 ring-border + 「Lang.」（≥420px 显示）
        └── div.flex（链接组）
              ├── 搜索（图标，在「文章」前）
              ├── SITE_NAV_ITEMS × 3（文章、作品、归档）
              └── 主题切换（图标）
```

导航数据：`lib/site-nav.ts` → `SITE_NAV_ITEMS`。文章、作品链到首页 `/#articles`、`/#works`。左缘、右缘与 `max-w-6xl` 内容区对齐。

### 7.2 外壳 `HeaderSurface`

| 状态 | 样式 |
|------|------|
| 页面顶部（`scrollY ≤ 8`） | `border-transparent bg-transparent`，与首页 Hero / 页面底色融为一体 |
| 首页滚动后，下方是 Hero 或文章区 | 实色 `bg-background`，无边框、无模糊 |
| 首页滚动后，下方是近期文章或作品 | 实色 `bg-foreground`，无边框、无模糊。同时加 `data-ink`，顶栏文字改成 `background`，否则墨色上看不见 |
| 其它页面滚动后 | `border-b border-border/70 bg-background/70 backdrop-blur-md supports-backdrop-filter:bg-background/60` |

过渡：`transition-[background-color,border-color] duration-300 motion-reduce:transition-none`。

### 7.3 导航链接样式

主导航文字链接共用 `components/header/nav-link-class.ts` 的 `headerNavLinkClass`：

```text
text-base leading-none text-foreground/70 hover:text-foreground
transition-colors duration-200 motion-reduce:transition-none
max-[375px]:text-sm
```

品牌「Lang.」：`text-lg font-semibold tracking-tight`，`≥420px` 显示。

搜索、主题切换共用 `headerIconButtonClass`：`size-8`，无边框，超窄屏 `size-7`；图标 `size-4`，`strokeWidth={1.75}`。搜索打开命令面板。

### 7.4 链接组内间距（等距规则）

```text
gap-x-3 max-[375px]:gap-x-2.5 sm:gap-x-5
```

**适用于**：搜索 / 文章 / 作品 / 归档 / 主题切换 — 全部同级视觉节奏。

### 7.5 图标按钮

搜索与主题切换是同一套无边框图标按钮，不再收进下拉菜单。搜索仍可用 `Ctrl+K` / `⌘K`。

### 7.6 Server / Client 边界

| Server | Client |
|--------|--------|
| `header/index.tsx` | `header-surface.tsx`（滚动状态，children 仍由服务端渲染） |
| `header-nav.tsx` | `header-search-button.tsx` |
| | `header-theme-toggle.tsx` |
| | `header-command-palette.tsx` |

---

## 8. Footer

### 8.1 布局

```text
footer（仅内页 mt-16 sm:mt-20）
  └── div（底色设在 footer 本身）
        /* 首页：跟上方作品块相反。作品 bg-foreground，页脚 background
           亮色 #f8f4ee / 文字 #252525，暗色 #252525 / 文字 #f8f4ee
           内页 data-footer="page"：亮色 #252525 / 文字 #f8f4ee，暗色 #f8f4ee / 文字 #252525 */
        └── max-w-6xl mx-auto px-4 py-10 sm:px-6 sm:py-12 lg:py-14
              └── lg:grid-cols-[1fr_1fr] gap-10 lg:gap-12 xl:gap-16
```

根布局共享顶栏；`app/(home)/layout.tsx` 输出首页页脚，`app/(pages)/layout.tsx` 输出带 `data-footer="page"` 的内页页脚。两个路由组都保留相同的 `<main>` 容器。静态首屏直接输出正确的页脚，客户端导航随路由组切换。

首页页脚底色跟正上方内容块相反。现在上方是作品：作品用 `#252525` 时页脚用 `#f8f4ee`，作品用 `#f8f4ee` 时页脚用 `#252525`。实现上作品是 `bg-foreground`，首页 `--footer` 取 `var(--background)`。作品块改色时，页脚跟着对调。

### 8.2 左侧品牌区

- 标题：`text-3xl sm:4xl md:5xl font-semibold tracking-tight`
- 简介：`text-sm sm:text-base leading-relaxed text-footer-foreground/75`，`max-w-md`
- 社交图标：`gap-4`；GitHub `size-5`，X `size-4`。新标签打开 `siteConfig.social` 里的 GitHub 与 X（`rel="noopener noreferrer"`，带 `aria-label`）

### 8.3 右侧链接区

三列 `grid-cols-3`，窄屏也并排，不把「联系」单独折到下一行：

| 列 | 标题样式 | 链接样式 |
|----|----------|----------|
| 导航 | `footerHeading` | `footerLink` |
| Feeds | 同上（Feeds 未 uppercase） | 同上 |
| 联系 | `footerHeading` | 同上 |

```text
footerHeading = text-[0.6875rem] font-medium tracking-[0.16em] text-footer-foreground/55 uppercase
footerLink    = text-sm text-footer-foreground/90 hover:text-footer-foreground
```

链接列表：`mt-4 space-y-2.5`；`prefetch={false}`。

---

## 9. 首页 Hero 与 Particle Scroll

文件：`components/home/home-hero.tsx`（壳 + 文案）、`components/home/hero-particles.tsx`（three.js 粒子）、`components/home/particle-scroll.tsx`（正文沙化）。

### 9.1 区块几何

```text
section: relative -mx-4 sm:-mx-6 overflow-hidden
         -mt-[var(--site-header-height)]   /* SITE_HEADER_OFFSET.margin，顶到视口上沿 */
         h-svh min-h-[30rem]                /* SITE_HEADER_OFFSET.heroHeight，铺满首屏 */
         bg-background text-foreground      /* 纸色。暗色模式 foreground / background 对调，Hero 变成墨色 */
```

图层自下而上：粒子画布（外层 `mask` 底部 22% 渐隐，避免粒子在 Hero 下沿被切）→ 文案。粒子后面不加色晕。

### 9.2 粒子对象

重瓣菊花由五层细长的舌状花瓣组成，外瓣舒展，内瓣向花心收拢。花瓣有弧度，三分之四偏正面的视角能看出层次。

- 桌面使用 22000 个点。花心在内容区约 75% 处，垂直对齐文案组中线。花径上限 460px，同时受首屏高度的 65% 和文案右侧可用宽度限制；大花径下点径随花瓣等比增大。
- 手机使用 9500 个点。花朵居中，直径上限 240px，花与标题之间预留约 36px。
- 花瓣从花心的 `--hero-pollen` 过渡到以 `--hero-petal` 为主的外缘。浅色用赭红与琥珀，深色用杏粉与浅金；主题切换时重新读取令牌。
- 两个主题均使用普通透明混合，后层花瓣亮度较低。

### 9.3 Hero 动效

| 行为 | 说明 |
|------|------|
| 入场 | 约 2.2s 内从花瓣周围聚拢，各点错时显现 |
| 风动 | 阵风从左向右掠过，迎风侧外瓣先弯，花头绕下方支点稍晚倾斜，随风势减弱回正 |
| 鼠标 | 鼠标靠近时推开局部粒子 |
| 滚动 | 按 Hero 滚出比例，粒子像沙一样向下坠落、横向散开并淡出 |
| 暂停 | 离开视口或标签页隐藏时不渲染 |
| 减少动效 | 直接显示花朵静态帧，不挂指针事件，文字无入场 |
| 无 WebGL | 不渲染粒子，只留底色与文案 |

### 9.4 文案

- 布局：`max-w-6xl` 容器内左对齐；桌面垂直居中，lg 起文案向内收 48px，手机 `items-end pb-16`。
- 标题：`Hi, I’m Lang 👋`（手势为标题字号的 75%）。`text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] text-foreground`
- 副文：两行，`Former DevOps Engineer.` / `Now an unemployed OPC making AI slop.`。`text-base sm:text-lg text-foreground/70`
- 社交：`gap-4 sm:gap-5`；GitHub、X 都是外链（`target="_blank"`，`rel="noopener noreferrer"`），地址读 `siteConfig.social.github.url`、`siteConfig.social.twitter.url`。GitHub `size-5`，X `size-4`。`text-foreground/60 hover:text-foreground`
- 入场：`motion` fade-up，`0.8s`，依次延迟 0.2 / 0.35 / 0.5s。

### 9.5 Particle Scroll（正文沙化）

首页有两段 `<ParticleScroll>`：`app/(home)/page.tsx` 包住近期文章，`home-shelf.tsx` 只包住文章目录，作品直接显示。视口 70% 处是成形线：线以上是真实 DOM（可点击、可 hover），线以下化成沙，向上滚动时逐行、逐粒归位。沙粒颜色来自文字和卡片，区块底色本身不进遮罩。

着色器参考 canvas-ui 的 `particle-scroll-react`。那版依赖实验性 HTML-in-Canvas API（只有开了实验开关的 Chrome 可用），并要求内容放进独立滚动容器，所以没有直接安装。这里改成：

1. **栅格化**：把子树的背景色、边框、文字（逐字 `Range.getClientRects` + `fillText`）画进离屏 canvas，作为沙粒颜色纹理。有 `border-radius` 时背景和边框按圆角画，角外留透明，沙不会铺出直角。图片按元素框和 `object-fit` 画进沙；还没加载完就先不画，加载后再拍一次。描边图标（`path`、`line`、`circle`、`rect`）按 `viewBox` 画进沙，书签这类 Lucide 图标才能粒子化。字体加载完、尺寸变化、子树增删时重拍（防抖 160ms）。主题切换在 class 变更的同一轮重拍并立刻画上，不等下一帧，也不被悬停锁挡住。指针在区块里，以及离开后的 400ms 内，不重拍尺寸和子树，也不清成形进度。离开并过了这段时间后，若悬停期间文字变过，即使宽高相同也重拍一次；否则宽高相同就跳过，避免悬停收起时把整段文字再拍一遍。
2. **遮罩**：第一条未成形行以下，用 `mask-image` 把 DOM 隐去（12px 渐隐），交给粒子。
3. **粒子**：WebGL2 点精灵。画布是内容的兄弟节点，`absolute`、`z-20`、`pointer-events-none`，宽等于视口，高等于视口加上下各 30% 的余量，每帧用 `translate3d` 挪到视口上方余量处，随文档一起滚动。不能用 `fixed`：浏览器的合成器滚动比主线程画沙快，快速滚动时 DOM 和遮罩先滚上去，沙还按旧位置画，中间露出一条区块底色。外层 `overflow-y: clip`：画布不撑长页面，沙也不落进相邻区块；横向不裁，沙可以散出内容列。只处理与画布（含下方散开余量）相交的行。滚动惯性只拖文字和边缘的沙，卡片底色的沙不跟着下坠。行越过成形线还没归位时，越过得越远归位越快。
4. **区块结束**：底边还在视口外时，成形线停在 70%。底边进入视口之后才往下推，再滚过「70% 线到视口底」的一半，这一段才全部成形。近期文章和文章目录各自算，不互相等。整页接近页脚时同样下推，滚到页脚时也不会剩沙。

| 参数 | 值 |
|------|-----|
| point / band | 0.7 / 380px |
| density / size | 2px / 1.25px |
| spread / gravity / swirl | 200px / 0.35 / 60px |
| stagger / fade | 0.7 / 0.85 |
| settle / smoothing | 1.1s / 0.5s |

卡片底是大块纯色，和区块底色对调，散开后才看得清卡片。纯色区域大约留七成沙粒，位移约为文字的 0.14 倍，所以卡片之间的空隙还在，沙也不会沉成一堆；文字和边缘仍用上面的 spread。一行归位时底色沙粒补全，再交还给 DOM。

降级：减少动效或无 WebGL2 时不挂引擎、不加遮罩，就是普通 DOM。

### 9.6 Hero 与正文的衔接

- 首页只有两种底色，交替使用：Hero、文章是 `bg-background`（纸色）；近期文章、作品是 `bg-foreground`（墨色）。暗色模式这两个变量对调，四段跟着反过来。
- Hero 粒子滚动时向下坠落；正文顶部几行在首屏就处于半散开状态，沙粒漂进 Hero 下沿。

### 9.7 首页下层（文章 / 作品）

文件：`components/home/home-shelf.tsx`。放在近期文章下面。底色写在 `<section>` 上，`ParticleScroll` 只包里面的文字和分行，所以底色和近期文章一样始终在，不会等沙成形才出现。文章区成形线和近期文章相同，作品区直接显示。满宽破出 `main` 的水平留白（与 Hero 同一套 `left-1/2 w-screen -translate-x-1/2`）。首页页脚本身没有上外边距，直接衔接作品区。接近页脚时随页尾成形线一起还原。

| 块 | 锚点 | 底色 | 内容 |
|----|------|------|------|
| 文章 | `#articles` | `bg-background` | 至少一屏高，内容整组垂直居中，超高时自然撑开。左栏引文与右栏目录顶部对齐。栏目名、简介、篇数与箭头组成整行链接；窄屏的简介换到下一行。行完整成形后，悬停或键盘聚焦时箭头向右上微移，减少动效时保持静止。 |
| 作品 | `#works` | `bg-foreground` | 桌面端至少一屏高（`min-h-svh`）。左栏是名字和摘要，贴着顶部，条目之间没有分隔线；悬停整行时名称和摘要一起轻微下压，没有下划线。右栏只有产品截图，没有卡片、标题和 more。亮色、暗色各一张（`siteConfig.works[].image.light`、`image.dark`），随主题切换。桌面端图片靠右，宽度约为右列的 78%，画幅 4:3，比原先略窄、略高，顶边略高于区块高度的 1/3，下方留空，右缘仍与文章目录右缘对齐，点图片去 `moreHref`（`/products/[slug]` 或站外链接）。悬停左栏某一条，右栏才按指针做 3D 倾斜。作品区直接显示，无滚动沙化。手机端不撑满一屏：上下排，图片跟在列表下面，与文字同宽、左对齐。moreHref 是 `/products/[slug]` 时才生成详情页，站外链接不生成；详情页正文还没做。 |

和上面交替：文章接 Hero 的纸色，作品接近期文章的墨色。区块底色只用这两种。手机端作品标题后直接列项目；Hero 社交链接和页脚链接的触控高度为 44px。窄屏分类列表将日期放在标题上方。近期文章末尾链接到归档。非空栏目排在空栏目之前，目录上方标「栏目」，末行无底线。暗色近期文章右栏悬停是 `#252525`。首页页脚跟上方作品块相反：亮色 `#f8f4ee`、暗色 `#252525`。锚点用 `SITE_HEADER_OFFSET.anchorScrollMargin`。

---

## 10. 文章列表模式（共享）

用于：首页近期文章、分类页列表、归档列表。

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

- 展示 10 篇（`DISPLAY_COUNT`）。右栏悬停 `--recent-row`：亮色纸色，暗色 `#252525`。行高不变。标题用 `scale-110`、`origin-bottom-left` 放大，不占额外高度。日期只在 active 时 `translate-x-2`（8px）向右，`transition-[translate,color] duration-300`，`motion-reduce:translate-none` 时不位移。底边过了成形线（`data-particle-reveal`）才进入悬停；还在沙里时不改变这一行。线滚过、指针已经在上面时再补上悬停
- 左栏保留引文，悬停或聚焦条目时在引文下显示标签和字数
- 表头：`text-[0.6875rem] tracking-[0.14em] uppercase text-muted-foreground`。只在 `md` 及以上显示；手机不放「日期 / 标题」行。标题 `#recent-posts-heading` 用 `SITE_HEADER_OFFSET.anchorScrollMargin`。日期列手机 `4.75rem`、`gap-x-3`、行 `py-5`。

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

路由：`app/(pages)/blog/[slug]/page.tsx`

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

- 含汉字的查询优先展示标题包含完整查询词的文章，再按全文相关性补足，最多八条。
- 唤起：`Ctrl+K` / `⌘K`；或顶栏搜索按钮。使用非模态（`modal={false}`）避免锁定 `body` 滚动导致页面宽度抖动。
- 对话框：`sm:max-w-md`（紧凑尺寸），输入栏高 `h-11`
- 占位符：`搜索文章或命令…`
- 快捷操作：内置「全站访问趋势（PV / UV）」，亦可直接按 `⌘.` / `Ctrl+.` 唤起底部趋势抽屉（`header-analytics-drawer.tsx`，动态 import 无 SSR）
- 结果上限 8 条；`title` boost ×3，`keywords` boost ×2
- 索引预取：首次表达搜索意图时加载，与并发打开共用请求；失败可在面板重试

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
- Hero：减少动效时粒子直接成形、静态渲染一帧，文字不做入场动画
- Particle Scroll：减少动效时不启用，正文为普通 DOM

---

## 18. 主题与暗色模式

- 实现：`next-themes`，`attribute="class"`，`defaultTheme="system"`
- **`disableTransitionOnChange`**：切主题时禁止过渡，防闪烁
- 暗色触发：`html.dark`（`@custom-variant dark (&:is(.dark *))`）
- 快捷键：非输入态且无弹层打开时按 `D` 切换明暗模式（`components/theme-provider.tsx`）
- Shiki / Giscus / Tweet 均依赖 `html.dark` 或独立 CSS 变量，新增嵌入时需双主题验证

---

## 19. 无障碍（a11y）

| 项 | 要求 |
|----|------|
| 导航 | `nav[aria-label="主导航"]` |
| 目录 | `nav[aria-label="文章目录"]`；当前项 `aria-current="location"` |
| 主题按钮 | `aria-label` 随模式切换中英文描述 |
| 搜索 | 无边框图标按钮，`aria-label` 为「搜索」 |
| 装饰图 | `alt=""` + `aria-hidden` 或 `role="img" aria-hidden` |
| 触屏目标 | 关键按钮 `min-h-11`；`touch-manipulation` |
| 安全区 | Footer `pb-[env(safe-area-inset-bottom)]`；FAB/抽屉适配 `safe-area-inset-*` |
| 焦点 | 可见 ring，不禁用 outline（`outline-ring/50` 基线） |

---

## 20. Giscus 评论区

文件：`components/comments.tsx`，挂载于博文页上下篇导航之后（`#comments`，`mt-12`，未挂载占位 `min-h-48`）。

- **数据源**：GitHub Discussions（`gnalli/Lang`、`General`、`mapping="pathname"`、`strict="1"`、`inputPosition="top"`、`loading="lazy"`）。
- **主题同步**：通过 `{origin}/giscus/site-light.css` 与 `site-dark.css` 对齐 §2 令牌，切换明暗模式时更新同一个 widget 的 `theme`，保留阅读位置与输入。
- **自定义裁剪（两主题共有）**：隐藏 `.gsc-reactions-count` 与 `.gsc-left-header > em`，关闭 `.gsc-homepage-bg` 动画。
- **CORS**：`next.config.mjs` 为 `/giscus/:path*` 配置 `Access-Control-Allow-Origin: *`，勿移除。

---

## 21. 打赏弹层

文件：`components/blog/article-toc-sidebar-actions.tsx`（`TocDonateButton`），配置在 `lib/config.ts` 的 `siteConfig.donate`；仅桌面端（`lg+`）侧栏 TOC 下方显示，移动端抽屉不含。

- **交互与定位**：悬停/聚焦展开，位于按钮上方右对齐（`bottom-full right-0 z-50 pb-2`），外层 `pb-2` 作 hover 桥接区，宽 `min(21rem, calc(100vw - 2rem))`，侧栏需保持 `overflow-visible` 避免裁剪。
- **二维码槽**：双列 `aspect-square`，图片框固定 `bg-white` 保证暗色模式下可正常扫码。

---

## 22. 变更检查清单

- **Header 与高度**：改 `--site-header-height` 时同步核对 `lib/site-header-offset.ts`、Hero 顶底露缝、锚点 `scroll-margin`、TOC sticky 与 404 高度；保持导航等距。
- **主题成对改**：`:root` / `.dark`、`public/giscus/site-light.css` / `site-dark.css`、Shiki、Tweet、打赏 QR 白底均需双主题验证。
- **三处列表一致**：首页近期文章、分类页、归档页的 active 行交互与日期格式保持一致。
- **上线前**：执行 `npm run typecheck && npm run lint && npm run build`。
