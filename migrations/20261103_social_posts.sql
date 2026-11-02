-- Persistent publishing history for automated social posts.
--
-- Safe to rerun: CREATE TABLE / INDEX use IF NOT EXISTS, and grants are
-- idempotent. The unique index is the duplicate-record guard.
--
-- If the unique index creation fails, inspect existing rows first; do not
-- blindly delete them:
--   select platform, event_id, count(*)
--   from public.social_posts
--   group by 1,2 having count(*) > 1;
--
-- Access model:
--   * RLS is enabled.
--   * No policy is created for anon/authenticated.
--   * anon/authenticated table privileges are revoked.
--   * only the server-side service role may read/write publishing history.

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

create unique index if not exists social_posts_platform_event_uidx
  on public.social_posts (platform, event_id);

create index if not exists social_posts_platform_posted_idx
  on public.social_posts (platform, posted_at desc);

alter table public.social_posts enable row level security;

revoke all on table public.social_posts from public;
revoke all on table public.social_posts from anon, authenticated;
grant select, insert, update, delete on table public.social_posts to service_role;

comment on table public.social_posts is
  'Server-side social publishing history and event snapshots. Service role only.';
