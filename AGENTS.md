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

- 默认 Server Component。只有 state、事件或浏览器 API 才加 `"use client"`，并收成叶子组件。Header 的 `index.tsx`、`header-nav.tsx` 和页脚是 Server Component；`app/(home)/layout.tsx` 与 `app/(pages)/layout.tsx` 分别渲染首页和内页页脚。`header-surface.tsx`（滚动状态，以 children 包住服务端导航）、搜索、访问趋势、主题是 Client Component。
- `params` / `searchParams` 是 Promise，使用前 `await`。
- `export const revalidate = 120` 必须是字面量，不能引用常量。
- 颜色用语义令牌（`bg-background`、`text-muted-foreground`、`border-border`）。不要新写 `bg-zinc-500` 或手写 `dark:` 颜色。已有例外记在 `DESIGN.md`（进度条、Tweet）。
- 条件 class 用 `cn()`。动效用 `motion/react`，并尊重 `useReducedMotion()` / `motion-reduce:`。

## 这个仓库容易改错的地方

**Header 高度只有一个来源。** `--site-header-height` 在 `app/globals.css`：默认 `4rem`，`sm`（640px）及以上 `4.25rem`。`header-surface.tsx` 直接用 `h-(--site-header-height)`，改高度只改变量，再确认头像与主题按钮放得下。

页面上的顶栏占位、锚点、TOC sticky、404 高度只用 `lib/site-header-offset.ts` 的 `SITE_HEADER_OFFSET`。不要写 `scroll-mt-20` 这类魔法数。

**导航必须等距。** 链接组与 `HeaderNavActions`（访问趋势、主题切换）都使用 `gap-x-3 max-[375px]:gap-x-2.5 sm:gap-x-5`。搜索按钮在「文章」前面，和链接组同一条 gap。文字链接共用 `headerNavLinkClass`，图标按钮共用 `headerIconButtonClass`（`components/header/nav-link-class.ts`），不要加圆形边框。

**首页下层。** 首页只有两种底色，交替使用：Hero 和文章是 `bg-background`，近期文章和作品是 `bg-foreground`。暗色模式这两个变量对调，四段跟着反过来，不要再加第三种底色。顶栏在首页滚动后用和正下方区块相同的实色，不要加边框或毛玻璃；压在墨色区块上时加 `data-ink`，文字改用 `background`。文章和作品的底色写在 `ParticleScroll` 外面的 `<section>` 上，跟近期文章一样始终在。近期文章、文章、作品各一段 `ParticleScroll`，成形线相同。文章区至少一屏高。作品区桌面端至少一屏高：左栏贴着顶部，右栏图片顶边略高于区块高度的 1/3，下方留空。手机端按内容高度，图片跟在列表下面。文章区左栏一段引文，悬停在完整成形的卡片上时，引文下方淡入该板块篇数；右栏三张竖向卡片，列比与近期文章相同。卡片用 `bg-article-card`：浅色 `#333333`，暖调弥散阴影 `rgb(158 122 77 / 0.06)`；暗色 `#f8f4ee`。右上角书签和直角「进入」同色（亮 `#f8f4ee`、暗 `#252525`，书签要能粒子化）。悬停不改卡片底色，按钮用 `color-mix` 在 250ms 贝塞尔下变色，完整成形后才上移 4px。暗色近期文章右栏悬停是 `#252525`，底边过了成形线才展开。标题用缩放放大，摘要在左栏，右栏行高不变。悬停期间粒子不重拍。首页页脚始终和上方作品块相反：作品是 `bg-foreground`（亮色 `#252525`、暗色 `#f8f4ee`），页脚是 `bg-background`（亮色 `#f8f4ee`、暗色 `#252525`），文字用对侧色；作品块改色时页脚跟着对调。内页页脚亮色 `#252525`、暗色 `#f8f4ee`，文字用对侧色。桌面端第一张卡片顶与引文对齐。作品区桌面端左栏是名字和摘要，右栏只有产品截图（`image.light`、`image.dark`，随主题切换），没有卡片、标题和 more。桌面端图片靠右，宽度约为右列的 78%，画幅 4:3，比原先略窄、略高，顶边略高于区块高度的 1/3，右缘仍与文章区卡片对齐；手机端图片与文字同宽、左对齐，跟在列表下面，点图片去 `moreHref`（`/products/[slug]` 或站外链接）。左栏悬停时名称和摘要一起轻微下压，没有分隔线，也没有下划线。悬停左栏某一条，且图片已经完整成形时，右栏才做 3D 倾斜；还在沙里时不倾斜、也不换图片。截图按画面画进沙。条目改 `siteConfig.works`。moreHref 是 `/products/[slug]` 时才生成详情页，站外链接不生成；详情页正文还没做。顶栏「文章」「作品」链到 `/#articles`、`/#works`，锚点用 `SITE_HEADER_OFFSET.anchorScrollMargin`。

**Hero 与 Particle Scroll。** Hero 首屏铺满视口（`SITE_HEADER_OFFSET.heroHeight`），底色是 `bg-background`，和近期文章的 `bg-foreground` 分开。粒子在 `components/home/hero-particles.tsx`（three.js），只能经 `next/dynamic` + `ssr: false` 加载，不能让 `three` 进服务端或其它页面的包。粒子颜色运行时读 CSS 变量，不要写死色值。正文沙化在 `components/home/particle-scroll.tsx`（原生 WebGL2，无依赖），它会自己栅格化子树，所以包住的内容只靠背景、边框、文字表达；有圆角时按圆角画，角外不铺沙。图片按框画进沙。描边图标会画进沙。输出画布是内容的兄弟节点，`absolute` 并随文档滚动，每帧挪到视口处（上下各留余量），外层 `overflow-y: clip`。不要改回 `fixed`：合成器滚动快于主线程，快速滚动时沙会落后于 DOM 和遮罩，露出底色。滚动惯性不要拖卡片底色的沙。Hero 粒子在桌面右缘对齐顶栏主题图标，按每种形态的半径和透视单独算偏移；手机上居中，落在顶栏和文案之间，不压住文字。区块底色不要写进被遮罩的那一层，否则滚到才看得到。两者改动时都要保留：减少动效时关闭、离开视口暂停、卸载时释放 GPU 资源（particle-scroll 还要清掉 `mask-image`）、无 WebGL 时静默降级。

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
