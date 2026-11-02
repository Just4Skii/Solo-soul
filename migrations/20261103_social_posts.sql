-- Persistent publishing history for automated social posts.
-- Apply once in Supabase SQL Editor (or via your migration runner).
-- No public RLS policy: only the service role (server) may read or write.

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'facebook',
  event_id text not null,
  event_title text not null,
  slug text,
  post_id text,
  event_snapshot jsonb,
  posted_at timestamptz not null default now()
);

create index if not exists social_posts_platform_posted_idx
  on public.social_posts (platform, posted_at desc);

create index if not exists social_posts_platform_event_idx
  on public.social_posts (platform, event_id);

alter table public.social_posts enable row level security;
