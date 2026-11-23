<!-- BEGIN:nextjs-agent-rules -->
# 这不是你训练数据里的 Next.js

本项目使用 **Next.js 16** App Router 与 **React 19**。API 与文件约定可能和旧版不同。写 Next.js 相关代码前，先查 `node_modules/next/dist/docs/` 里对应的指南，并留意弃用说明。
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Lang's Blog

中文个人技术博客。文章是 `content/blogs/*.md`，由 Content Collections 编译成 MDX，静态生成。包管理只用 **npm**。

视觉与交互的像素级说明在 [DESIGN.md](./DESIGN.md)。部署与环境变量在 [README.md](./README.md)。本文只写改代码时必须遵守的约束。实现与文档不一致时，以代码为准，并回写对应文档。

## 先读哪里

| 要改的东西 | 先读 |
|---|---|
| 颜色、间距、Header、Hero、列表、TOC、评论、打赏、趋势图 | `DESIGN.md` 对应章节，不要整篇塞进上下文 |
| 站名、SEO、打赏文案与收款码 | `lib/config.ts` |
| 顶栏与页脚链接 | `lib/site-nav.ts` |
| 栏目文案 | `lib/blog-sections.ts` |
| 正文排版 class | `lib/blog-article-prose.ts` |

不要把 `DESIGN.md` 的色值、字号、动效参数抄进本文。

## 框架约定

- 默认 Server Component。只有 state、事件或浏览器 API 才加 `"use client"`，并收成叶子组件。Header 的 `index.tsx`、`header-nav.tsx` 和页脚是 Server Component；`app/(home)/layout.tsx` 与 `app/(pages)/layout.tsx` 分别渲染首页和内页页脚。`header-surface.tsx`（滚动状态，以 children 包住服务端导航）、搜索、主题是 Client Component。
- `params` / `searchParams` 是 Promise，使用前 `await`。
- `export const revalidate = 120` 必须是字面量，不能引用常量。
- 颜色用语义令牌（`bg-background`、`text-muted-foreground`、`border-border`）。不要新写 `bg-zinc-500` 或手写 `dark:` 颜色。已有例外记在 `DESIGN.md`（进度条、Tweet）。
- 条件 class 用 `cn()`。动效用 `motion/react`，并尊重 `useReducedMotion()` / `motion-reduce:`。

## 这个仓库容易改错的地方

**Header 高度只有一个来源。** `--site-header-height` 在 `app/globals.css`：默认 `3.25rem`，`sm`（640px）及以上 `3.5rem`。`header-surface.tsx` 直接用 `h-(--site-header-height)`，改高度只改变量，再确认头像与主题按钮放得下。

页面上的顶栏占位、锚点、TOC sticky、404 高度只用 `lib/site-header-offset.ts` 的 `SITE_HEADER_OFFSET`。不要写 `scroll-mt-20` 这类魔法数。

**导航必须等距。** 链接组内搜索、导航链接与主题切换共用 `gap-x-3 max-[375px]:gap-x-2.5 sm:gap-x-5`。搜索按钮在「文章」前面，和链接组同一条 gap。文字链接共用 `headerNavLinkClass`，图标按钮共用 `headerIconButtonClass`（`components/header/nav-link-class.ts`），不要加圆形边框。

**首页下层。** 视觉细则见 `DESIGN.md` 第 9 节，改代码时必须守住：
- **双底色交替**：仅用 `bg-background`（Hero、文章）与 `bg-foreground`（近期文章、作品）交替，不加第三种底色；底色写在 `ParticleScroll` 外层 `<section>` 上。
- **顶栏与页脚跟随**：顶栏在首页滚动后取正下方区块实色（无边框/毛玻璃），压在墨色块上时加 `data-ink`；首页页脚始终与作品块反色，内页页脚亮色 `#252525`、暗色 `#f8f4ee`。
- **ParticleScroll 范围**：仅近期文章与文章目录各包一段（同成形线），作品区直接展示；近期文章悬停仅在行底边过成形线后触发，且悬停期间不重拍粒子。
- **作品数据与路由**：条目维护在 `siteConfig.works`，截图随主题切 `image.light` / `image.dark`；仅当 `moreHref` 为 `/products/[slug]` 时生成详情页。
- **锚点**：顶栏「文章」「作品」链到 `/#articles`、`/#works`，使用 `SITE_HEADER_OFFSET.anchorScrollMargin`。

**Hero 与 Particle Scroll。** Hero 首屏铺满视口（`SITE_HEADER_OFFSET.heroHeight`），底色是 `bg-background`，和近期文章的 `bg-foreground` 分开。粒子在 `components/home/hero-particles.tsx`（three.js），只能经 `next/dynamic` + `ssr: false` 加载，不能让 `three` 进服务端或其它页面的包。粒子颜色运行时读 CSS 变量，不要写死色值。正文沙化在 `components/home/particle-scroll.tsx`（原生 WebGL2，无依赖），它会自己栅格化子树，所以包住的内容只靠背景、边框、文字表达；有圆角时按圆角画，角外不铺沙。图片按框画进沙。描边图标会画进沙。输出画布是内容的兄弟节点，`absolute` 并随文档滚动，每帧挪到视口处（上下各留余量），外层 `overflow-y: clip`。不要改回 `fixed`：合成器滚动快于主线程，快速滚动时沙会落后于 DOM 和遮罩，露出底色。滚动惯性不要拖卡片底色的沙。Hero 粒子菊花在桌面位于文案右侧，花心与文案组中线对齐；手机上居中，落在顶栏和文案之间，不压住文字。区块底色不要写进被遮罩的那一层，否则滚到才看得到。两者改动时都要保留：减少动效时关闭、离开视口暂停、卸载时释放 GPU 资源（particle-scroll 还要清掉 `mask-image`）、无 WebGL 时静默降级。

**列表行。** 首页（`components/home/home-recent-posts.tsx`）、分类（`components/topic/topic-page-content.tsx`）、归档（`components/archive/archive-list-expandable.tsx`）的 hover 反色行要一起看。摘要共用 `components/blog/post-list-inline-summary.tsx`。日期格式用 `lib/format-date.ts`，不要在组件里另写。三处行结构不完全相同，不要合成一个万能行组件。

**文章。** 新文章放 `content/blogs/<slug>.md`。`category` 只能是 `ops`、`ai`、`notes`。标签只用 `lib/blog-tags.ts` 的 `parseKeywords`。`featured` 在 schema 里，界面不读，不要靠它做功能。代码围栏语言用小写。

**密钥与可选服务。** `SUPABASE_SERVICE_ROLE_KEY`、`GITHUB_TOKEN` 只在服务端使用。未配置时返回空数据或 `ok: false`，不能让构建失败，也不能写进客户端。不要读取、打印或提交 `.env`。

**第三方主题成对改。** Giscus 改 `public/giscus/site-light.css` 与 `site-dark.css`。不要去掉 `next.config.mjs` 里 `/giscus/*` 的 CORS 头。

## 组件怎么拆

第二次出现、并且以后必须一起改的 UI，才抽成组件或放进 `lib/`。只使用一次的 JSX 留在原文件。shadcn 基元只放在 `components/ui/`，不要为了一次性样式去改它们的 API。

文件名 `kebab-case`，组件导出 `PascalCase`。页面用默认导出。

## 不要做的事

- 不要新增依赖、测试框架、Biome 或 Husky，除非用户明确要求。
- 不要手改 `.content-collections/`、`.next/`、`node_modules/`。
- 不要用 `shadcn add --overwrite` 覆盖 `components/ui/`。
- 不要只改浅色令牌不改 `.dark`，或只改一份 Giscus 主题。

## 改完怎么验

```bash
npm run typecheck && npm run lint
```

动了路由、内容管道或 `next.config.mjs` 时再跑 `npm run build`。样式改动要看浅色/深色，以及手机与桌面。改 Header 或 Hero 时确认顶底没有露缝，TOC sticky 和标题锚点没有被顶栏挡住。

仓库没有测试框架。`npm run build` 会预渲染全部博文。不要为了「有测试」先加框架；只有 `parseKeywords`、`extractToc`、`formatDate` 这类纯函数再改出 bug 时，才为那一个函数补几条用例。
