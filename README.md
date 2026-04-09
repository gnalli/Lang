# Lang — 个人博客

基于 **Next.js**（App Router）、**Content Collections**、**MDX**、**Tailwind CSS v4** 与 **shadcn/ui** 的静态向博客：文章本地 Markdown、RSS/Atom、站点地图、暗黑模式与评论（Giscus）等。

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
```

## 写文章

1. 在 `content/blogs/` 下新增 **`*.md`**。
2. 顶部 **frontmatter** 需符合 `content-collections.ts` 中的 schema：必选 `title`、`date`；可选 `updated`、`summary`、`keywords`、`featured` 等。正文写在 frontmatter 下面的 Markdown 里，无需手写 `content` 字段。
3. 保存后由 Content Collections 在构建/开发时编译 MDX。

详见仓库内 `content-collections.ts` 与现有文章示例。

## 站点配置

- **`lib/config.ts`**：站点名、作者 `site.author`（`name` + `profilePath`）、生产域名 `seo.metadataBase`、Open Graph、RSS 等。**站点图标**：放在 **`public/favicon.ico`**（对应路径 `/favicon.ico`）；根布局里用 `<link rel="icon" href="/favicon.ico" />` 引用，避免 `metadata.icons` 与 `metadataBase` 拼成线上地址导致本地异常。

## 环境变量（按需）

若使用相关功能，可在项目根目录创建 **`.env`**（勿提交密钥；仓库已忽略 `.env`）：

| 变量 | 用途 |
|------|------|
| `NEXT_PUBLIC_APP_URL` | 开发时设为 `http://localhost:3000`（无尾斜杠）；生产构建可设为线上根 URL。用于作者链接、部分 JSON-LD 的站点根等与**当前环境域名**一致 |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | 若接入 Supabase 相关能力 |

具体引用见各模块源码。

## 404 页面

全局未匹配路由由 **`app/not-found.tsx`** 呈现（沿用站点头尾布局），并提供返回首页与归档的入口。

## 技术栈摘要

- Next.js 16 · React 19
- `@content-collections/*` + `remark-gfm` / `rehype-pretty-code` / `rehype-slug`
- 搜索、归档、标签页、分析埋点等见 `app/` 与 `components/`

