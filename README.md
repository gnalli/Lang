# Lang — 个人博客

基于 **Next.js**（App Router）、**Content Collections**、**MDX**、**Tailwind CSS v4** 与 **shadcn/ui** 的个人技术博客。文章以本地 Markdown 管理，支持 SSG、RSS/Atom、站点地图、暗黑模式、Giscus 评论与可选的阅读统计。

## 功能概览

- **栏目**：运维（`/ops`）、AI（`/ai`）、随记（`/notes`）、归档（`/archive`）
- **博文页**：Fumadocs 风格目录（滚动时渐进展开子标题）、代码块语言栏与复制、图片点击放大、同标签上下篇导航
- **侧边栏操作**：回到顶部、复制 Markdown 原文、打赏弹层（微信 / 支付宝收款码）
- **移动端**：目录抽屉 FAB
- **MDX 组件**：推文嵌入、GitHub 仓库卡片等（见下文）
- **评论**：Giscus，自定义浅色 / 深色主题（`public/giscus/`）
- **SEO**：canonical、sitemap、Article JSON-LD、Open Graph
- **可选分析**：Supabase 页面阅读量（需配置环境变量）

## 环境要求

- Node.js（建议使用当前 LTS）
- npm（或兼容的包管理器）

## 常用命令

```bash
npm install
npm run dev      # 开发：http://localhost:3000（Turbopack）
npm run build    # 生产构建
npm run start    # 运行生产构建
npm run lint     # ESLint
npm run typecheck
npm run format   # Prettier（ts/tsx）
npm run analyze  # 构建并打开 bundle 分析报告（@next/bundle-analyzer）
```

## 目录结构（摘要）

| 路径 | 说明 |
|------|------|
| `app/` | 页面与 API 路由 |
| `content/blogs/` | 文章 Markdown |
| `components/` | UI 与业务组件 |
| `lib/` | 站点配置、工具函数 |
| `public/` | 静态资源（图标、收款码、Giscus 主题 CSS 等） |
| `scripts/` | 字体分片生成脚本（`subset-wenkai.py`） |
| `content-collections.ts` | 文章集合与 MDX 编译管道 |
| `data/` | Supabase 等数据库迁移 SQL |

## 写文章

1. 在 `content/blogs/` 下新增 **`*.md`**。
2. 顶部 **frontmatter** 需符合 `content-collections.ts` 中的 schema：

   | 字段 | 必填 | 说明 |
   |------|------|------|
   | `title` | 是 | 标题 |
   | `date` | 是 | 发布日期 |
   | `updated` | 否 | 更新日期 |
   | `category` | 否 | `ops` / `ai` / `notes`，默认 `notes` |
   | `summary` | 否 | 摘要 |
   | `keywords` | 否 | 标签，逗号分隔 |
   | `featured` | 否 | 是否精选 |

   正文写在 frontmatter 下方，无需手写 `content` 字段。

3. 保存后由 Content Collections 在开发 / 构建时编译 MDX（`remark-gfm`、`rehype-pretty-code` + Shiki、`rehype-slug`）。

### MDX 嵌入组件

在正文中可直接使用：

```mdx
<Tweet id="推文 ID" />

<GitHubRepo owner="组织或用户名" repo="仓库名" />
```

- **Tweet**：基于 `react-tweet`，服务端缓存拉取。
- **GitHubRepo**：拉取 GitHub API 展示仓库信息；可选配置 `GITHUB_TOKEN` 提高 API 限额。

代码块自动带语言标识与复制按钮；围栏代码请使用小写语言标识（如 ` ```shell `），以便 Shiki 正确高亮。

## 站点配置

**`lib/config.ts`** 为主要入口：

- **`site`**：站点名、作者（`name` + `profilePath`）、描述、图标
- **`social`**：GitHub、Twitter、YouTube 等外链
- **`donate`**：侧边栏打赏文案与收款码图片路径（如 `/wx.jpg`、`/zfb.jpg`，文件放在 `public/`）
- **`seo`**：生产域名 `metadataBase`、Open Graph、robots 等

**图标**：`app/favicon.ico` 与 `public/apple-icon.png`，由 Next.js Metadata API 统一输出。

**字体**：正文字体（霞鹜文楷 GB2312 子集）按 `unicode-range` 切分为静态 WOFF2 存放在 `public/fonts/wenkai/`，由 `app/fonts/wenkai/faces.css` 加载并预加载首屏分片。新增大量生僻字需重新分片时，在 `npm run build` 后执行 `python3 scripts/subset-wenkai.py`（需 `fonttools` 与 `brotli`）。

**Giscus 主题**：`public/giscus/site-light.css`、`site-dark.css`，与站点暖色 editorial 风格一致；可在 CSS 中隐藏品牌文案等。

**导航**：`lib/site-nav.ts` 定义顶栏与页脚链接。

## 环境变量（按需）

在项目根目录创建 **`.env`**（勿提交密钥；仓库已忽略 `.env`）。可参考 **`.env.example`**。

| 变量 | 用途 |
|------|------|
| `NEXT_PUBLIC_APP_URL` | 开发：`http://localhost:3000`（无尾斜杠）；生产：线上根 URL。用于作者链接、JSON-LD 等与当前环境域名一致 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL（阅读统计等） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥（**勿**加 `NEXT_PUBLIC_` 前缀） |
| `GITHUB_TOKEN` | 可选；MDX `<GitHubRepo />` 调用 GitHub API 时使用，提高速率限制 |

具体引用见各模块源码。

## 阅读统计（Supabase，可选）

启用博文 PV/UV 与顶栏趋势图前，需在 Supabase 项目中执行迁移脚本。

1. 在 [Supabase](https://supabase.com/) 创建项目，获取 **Project URL** 与 **service_role** 密钥（Settings → API）。
2. 在 Supabase SQL Editor（或 `supabase db execute` / `psql`）中执行幂等迁移脚本 **`data/supabase_analytics_full_migration.sql`**，创建 `page_views` 表与 PV/UV 汇总视图（脚本末尾附历史回填与清理示例）。
3. 在 `.env` 配置 `NEXT_PUBLIC_SUPABASE_URL` 与 `SUPABASE_SERVICE_ROLE_KEY`（**切勿**加 `NEXT_PUBLIC_` 前缀），重启后即生效。

## 持续集成

GitHub Actions 工作流 **`.github/workflows/ci.yml`** 在 push / pull_request 时依次执行：

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

## 404 页面

全局未匹配路由由 **`app/not-found.tsx`** 呈现（沿用站点头尾布局），并提供返回首页与归档的入口。

## 技术栈摘要

- Next.js 16 · React 19
- `@content-collections/*` · MDX · Shiki（`rehype-pretty-code`）
- Tailwind CSS v4 · shadcn/ui · next-themes
- Giscus · react-tweet · Minisearch（命令面板搜索）
- 可选：Supabase（分析）、Recharts（趋势图）

**开发依赖说明**：`shadcn` CLI 位于 `devDependencies`（仅本地添加/更新组件时使用）；运行时样式通过 `app/globals.css` 中的 `@import "shadcn/tailwind.css"` 引入，生产构建阶段仍会安装 devDependencies。
