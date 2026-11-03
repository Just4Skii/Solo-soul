-- SSoul analytics baseline — read-only queries.
-- Run in the Supabase SQL Editor after 20261103_analytics_events.sql.
-- Keep this intentionally small; it is not a dashboard.

-- 1. Events recorded, last 30 days
select event_type, count(*) as events
from public.analytics_events
where occurred_at > now() - interval '30 days'
group by event_type
order by events desc;

-- 2. Unique visitors and sessions, last 30 days
select
  count(distinct visitor_id) as unique_visitors,
  count(*) filter (where event_type = 'pageview') as pageviews
from public.analytics_events
where occurred_at > now() - interval '30 days';

-- 3. Page views by page, last 30 days
select path, count(*) as views
from public.analytics_events
where event_type = 'pageview'
  and occurred_at > now() - interval '30 days'
group by path
order by views desc;

-- 4. Individual event views, last 30 days
select event_name, event_id, count(*) as views
from public.analytics_events
where event_type = 'event_view'
  and occurred_at > now() - interval '30 days'
group by event_name, event_id
order by views desc
limit 25;

-- 5. Outbound provider clicks, last 30 days
select
  metadata->>'provider' as provider,
  event_name,
  count(*) as clicks
from public.analytics_events
where event_type = 'outbound_click'
  and occurred_at > now() - interval '30 days'
group by 1, 2
order by clicks desc
limit 25;

-- 6. Traffic source / medium, last 30 days
select source, medium, campaign, count(*) as events,
       count(distinct visitor_id) as visitors
from public.analytics_events
where occurred_at > now() - interval '30 days'
group by 1,2,3
order by events desc;

-- 7. Registrations and completed bookings, last 30 days
select event_type, count(*) as events
from public.analytics_events
where event_type in ('registration', 'booking_start', 'booking_completed')
  and occurred_at > now() - interval '30 days'
group by event_type;

-- 8. Facebook-attributed visitors, last 30 days
select
  count(distinct visitor_id) as visitors,
  count(*) filter (where event_type = 'pageview') as pageviews,
  count(*) filter (where event_type = 'event_view') as event_views,
  count(*) filter (where event_type = 'outbound_click') as outbound_clicks
from public.analytics_events
where source = 'facebook'
  and occurred_at > now() - interval '30 days';
