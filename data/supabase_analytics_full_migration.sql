-- =============================================================================
-- 博客统计：完整迁移脚本（Supabase / Postgres）
-- 用途：新库一次性执行；或在新项目中复制本文件执行
-- 特性：幂等 safe（IF NOT EXISTS / OR REPLACE / DROP IF EXISTS）
-- 应用侧：仅通过服务端 SUPABASE_SERVICE_ROLE_KEY 读写；勿把 service_role 暴露到浏览器
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) 明细：每次浏览一条（Next.js POST /api/analytics/page-view）
-- -----------------------------------------------------------------------------
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  slug text,
  visitor_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists page_views_slug_idx on public.page_views (slug) where slug is not null;

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);

create index if not exists page_views_visitor_created_idx on public.page_views (visitor_id, created_at desc);

comment on table public.page_views is '全站页面浏览事件；博文页请填写 slug';

-- -----------------------------------------------------------------------------
-- 2) 视图：按 slug 聚合 PV / UV（security_invoker 满足 Supabase Linter）
-- -----------------------------------------------------------------------------
create or replace view public.blog_page_view_stats
with (security_invoker = true)
as
select
  slug,
  count(*)::bigint as pv,
  count(distinct visitor_id)::bigint as uv
from public.page_views
where slug is not null
group by slug;

comment on view public.blog_page_view_stats is '各博文 slug 的累计 PV 与 UV（visitor_id 去重）';

alter table public.page_views enable row level security;

-- 勿为 anon 添加 WITH CHECK (true) 的全开放 INSERT（Linter 会报宽松策略）。
-- 写入只靠服务端 SUPABASE_SERVICE_ROLE_KEY（该角色绕过 RLS）。
-- 若已有库曾误建 policy 需清掉，请单独执行：data/supabase_fix_page_views_drop_all_policies.sql

-- -----------------------------------------------------------------------------
-- 3) 累计表：排行榜读小表；删旧 page_views 行后总阅读数仍保留
-- -----------------------------------------------------------------------------
create table if not exists public.blog_slug_pv_totals (
  slug text primary key,
  pv bigint not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists blog_slug_pv_totals_pv_idx on public.blog_slug_pv_totals (pv desc);

comment on table public.blog_slug_pv_totals is '博文 slug 累计 PV（供排行榜）；明细见 page_views';

-- security definer；累计表启用 RLS（满足 Linter）。anon 无 policy 不可访问；服务端用 service_role 会绕过 RLS，触发器写入不受影响
create or replace function public.bump_blog_slug_pv_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.slug is not null and length(trim(new.slug)) > 0 then
    insert into public.blog_slug_pv_totals (slug, pv, updated_at)
    values (new.slug, 1, now())
    on conflict (slug) do update
      set pv = public.blog_slug_pv_totals.pv + 1,
          updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists page_views_bump_slug_pv on public.page_views;

create trigger page_views_bump_slug_pv
after insert on public.page_views
for each row
execute function public.bump_blog_slug_pv_total();

alter table public.blog_slug_pv_totals enable row level security;

-- -----------------------------------------------------------------------------
-- 4) 可选：将已有 page_views 回填进累计表（仅在有历史数据且第一次加累计表时执行一次）
-- -----------------------------------------------------------------------------
-- insert into public.blog_slug_pv_totals (slug, pv, updated_at)
-- select slug, count(*)::bigint, now()
-- from public.page_views
-- where slug is not null
-- group by slug
-- on conflict (slug) do update
--   set pv = excluded.pv,
--       updated_at = excluded.updated_at;

-- -----------------------------------------------------------------------------
-- 5) 可选：定期删除过旧明细（累计已在 blog_slug_pv_totals，按月/季在 SQL Editor 或 pg_cron 执行）
-- -----------------------------------------------------------------------------
-- delete from public.page_views
-- where created_at < (now() - interval '180 days');
