-- ============================================================
-- VeriCrawl — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── 1. profiles ────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  plan          text default 'trial',
  created_at    timestamptz default now()
);

-- Auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── 2. crawl_jobs ──────────────────────────────────────────
create table if not exists public.crawl_jobs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.profiles(id) on delete cascade,
  mode              text not null check (mode in ('scrape','map','crawl')),
  start_url         text not null,
  status            text default 'queued' check (status in ('queued','running','completed','failed','cancelled')),
  config            jsonb default '{}',
  max_pages         integer default 2000,
  worker_task_id    text,
  pages_discovered  integer default 0,
  pages_completed   integer default 0,
  pages_failed      integer default 0,
  error_message     text,
  created_at        timestamptz default now(),
  started_at        timestamptz,
  completed_at      timestamptz
);

create index if not exists crawl_jobs_user_id_idx on public.crawl_jobs(user_id);
create index if not exists crawl_jobs_status_idx on public.crawl_jobs(status);
create index if not exists crawl_jobs_worker_task_id_idx on public.crawl_jobs(worker_task_id);

-- ─── 3. crawl_pages ─────────────────────────────────────────
create table if not exists public.crawl_pages (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid references public.crawl_jobs(id) on delete cascade,
  url             text not null,
  title           text,
  status_code     integer,
  markdown        text,
  links           jsonb default '[]',
  ai_extraction   jsonb,
  error_message   text,
  crawled_at      timestamptz default now()
);

create index if not exists crawl_pages_job_id_idx on public.crawl_pages(job_id);

-- ─── 4. crawl_usage ─────────────────────────────────────────
create table if not exists public.crawl_usage (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete cascade,
  billing_period  date not null,
  pages_used      integer default 0,
  unique(user_id, billing_period)
);

create index if not exists crawl_usage_user_id_idx on public.crawl_usage(user_id);

-- ─── 5. increment_usage RPC (used by webhook) ───────────────
create or replace function public.increment_usage(
  p_user_id       uuid,
  p_billing_period date,
  p_pages         integer
)
returns void language plpgsql security definer as $$
begin
  insert into public.crawl_usage (user_id, billing_period, pages_used)
  values (p_user_id, p_billing_period, p_pages)
  on conflict (user_id, billing_period)
  do update set pages_used = crawl_usage.pages_used + excluded.pages_used;
end;
$$;

-- ─── 6. RLS policies ────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.crawl_jobs enable row level security;
alter table public.crawl_pages enable row level security;
alter table public.crawl_usage enable row level security;

-- profiles: users can only read/update their own row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- crawl_jobs: users can only see/insert/update their own jobs
drop policy if exists "jobs_select_own" on public.crawl_jobs;
create policy "jobs_select_own" on public.crawl_jobs
  for select using (auth.uid() = user_id);

drop policy if exists "jobs_insert_own" on public.crawl_jobs;
create policy "jobs_insert_own" on public.crawl_jobs
  for insert with check (auth.uid() = user_id);

drop policy if exists "jobs_update_own" on public.crawl_jobs;
create policy "jobs_update_own" on public.crawl_jobs
  for update using (auth.uid() = user_id);

-- crawl_pages: users can only see pages for their own jobs
drop policy if exists "pages_select_own" on public.crawl_pages;
create policy "pages_select_own" on public.crawl_pages
  for select using (
    exists (
      select 1 from public.crawl_jobs
      where crawl_jobs.id = crawl_pages.job_id
        and crawl_jobs.user_id = auth.uid()
    )
  );

-- crawl_usage: users can only see their own usage
drop policy if exists "usage_select_own" on public.crawl_usage;
create policy "usage_select_own" on public.crawl_usage
  for select using (auth.uid() = user_id);

-- NOTE: The webhook API route uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- That is intentional — the webhook inserts pages and updates jobs on behalf of the worker.
