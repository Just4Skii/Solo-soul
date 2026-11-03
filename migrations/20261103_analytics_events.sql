-- Lightweight first-party analytics for SSoul.
--
-- Stores only pseudonymous, aggregate-friendly events:
--   * no IP addresses
--   * no names, emails or phone numbers
--   * a random visitor id held in the browser
--   * coarse device and country only
--
-- Service role only. Safe to rerun.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  visitor_id text,
  event_type text not null,
  path text,
  event_id text,
  event_name text,
  source text,
  medium text,
  campaign text,
  referrer text,
  device text,
  country text,
  metadata jsonb
);

create index if not exists analytics_events_occurred_idx
  on public.analytics_events (occurred_at desc);

create index if not exists analytics_events_type_occurred_idx
  on public.analytics_events (event_type, occurred_at desc);

create index if not exists analytics_events_path_idx
  on public.analytics_events (path, occurred_at desc);

create index if not exists analytics_events_event_idx
  on public.analytics_events (event_id, occurred_at desc);

create index if not exists analytics_events_source_idx
  on public.analytics_events (source, occurred_at desc);

alter table public.analytics_events enable row level security;

revoke all on table public.analytics_events from public;
revoke all on table public.analytics_events from anon, authenticated;
grant select, insert, update, delete on table public.analytics_events to service_role;

comment on table public.analytics_events is
  'First-party, pseudonymous SSoul analytics events. Service role only.';
