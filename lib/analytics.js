/**
 * Server-side analytics writer.
 * Only the service role can write to analytics_events; failures are logged but
 * never allowed to break a booking, payment or page request.
 */
import { createClient } from '@supabase/supabase-js';

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const TYPES = new Set([
  'pageview',
  'event_view',
  'outbound_click',
  'registration',
  'booking_start',
  'booking_completed',
]);

const clean = (value, max) => value == null ? null : String(value).slice(0, max);

export async function trackServer(eventType, data = {}) {
  if (!supabase || !TYPES.has(eventType)) return { ok: false, error: 'Analytics not configured' };
  try {
    const metadata = data.metadata && typeof data.metadata === 'object' ? data.metadata : null;
    const { error } = await supabase.from('analytics_events').insert({
      visitor_id: clean(data.visitorId, 64),
      event_type: eventType,
      path: clean(data.path, 200),
      event_id: clean(data.eventId, 120),
      event_name: clean(data.eventName, 200),
      source: clean(data.source, 120),
      medium: clean(data.medium, 80),
      campaign: clean(data.campaign, 120),
      referrer: clean(data.referrer, 300),
      device: clean(data.device, 20),
      country: clean(data.country, 8),
      metadata,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
