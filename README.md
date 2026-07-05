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

**图标**：`public/favicon.ico`（路径 `/favicon.ico`）；根布局通过 `<link rel="icon">` 引用，避免 `metadata.icons` 与 `metadataBase` 在本地拼错域名。

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

### 1. 创建 Supabase 项目

在 [Supabase](https://supabase.com/) 控制台新建项目，记下 **Project URL** 与 **service_role** 密钥（Settings → API）。

### 2. 执行迁移 SQL

脚本路径：**`data/supabase_analytics_full_migration.sql`**（幂等，可重复执行）。

任选一种方式：

**Supabase Dashboard（推荐）**

1. 打开项目 → **SQL Editor** → **New query**
2. 将 `data/supabase_analytics_full_migration.sql` 全文粘贴进编辑器
3. 点击 **Run** 执行

**Supabase CLI / psql**

```bash
# 需已安装 supabase CLI 并 link 到项目，或使用数据库连接串
supabase db execute --file data/supabase_analytics_full_migration.sql

# 或使用 psql（连接串见 Supabase → Settings → Database）
psql "$DATABASE_URL" -f data/supabase_analytics_full_migration.sql
```

脚本会创建：

- `page_views` — 浏览明细（`POST /api/analytics/page-view` 写入）
- `blog_page_view_stats` — 按 slug 聚合 PV/UV 的视图
- `blog_slug_pv_totals` — slug 累计 PV（排行榜与博文页阅读数）

**安全说明**：仅通过服务端 `SUPABASE_SERVICE_ROLE_KEY` 读写；**切勿**将 service_role 暴露到浏览器或 `NEXT_PUBLIC_*` 变量。

### 3. 配置环境变量

在项目根目录 `.env` 中填入（参见 `.env.example`）：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

重启开发服务器或重新部署后，博文页会显示阅读数，顶栏「更多」菜单可查看近 14 日趋势（需 Supabase 有数据）。

### 4. 可选维护

迁移文件末尾含注释示例：历史数据回填累计表、定期清理过旧 `page_views` 明细。按需于 SQL Editor 中手动执行。

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
