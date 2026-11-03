/**
 * Cron Job: Verify ticket listings and publish the daily event.
 * /api/cron/verify-listings — Runs daily at 06:00 UTC via Vercel Cron.
 *
 * The social post starts first and the link checks run alongside it, so a
 * slow provider cannot consume the whole function invocation before publishing.
 */

import { createClient } from '@supabase/supabase-js';
import { runDailyPost } from '../../lib/social.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || 'solo-soul-cron-secret-2026';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CITY_EVENTS = [
  { title: 'Disney On Ice',                 url: 'https://www.webtickets.co.za/v2/search.aspx?search=Disney+On+Ice' },
  { title: "Totalsports Women's Race",      url: 'https://www.totalsportswomensrace.co.za/durban-event/' },
  { title: 'Sjava in the Park',             url: 'https://www.webtickets.co.za/v2/search.aspx?search=Sjava+in+the+Park' },
  { title: 'Secret Sunrise Durban',         url: 'https://www.webtickets.co.za/v2/search.aspx?search=Secret+Sunrise+Durban' },
  { title: 'Tamia LIVE in Durban',          url: 'https://www.webtickets.co.za/v2/search.aspx?search=Tamia+Durban' },
  { title: 'Joseph Clark – Music of Queen', url: 'https://tickets.computicket.com/search?q=Joseph+Clark+Queen' },
  { title: 'Old Mutual Music at the Lake',  url: 'https://www.webtickets.co.za/v2/search.aspx?search=Music+at+the+Lake+Durban' },
  { title: 'Bafunny Bafunny Comedy Fest',   url: 'https://tickets.computicket.com/search?q=Bafunny+Bafunny' },
  { title: 'Hollywoodbets Durban 10km',     url: 'https://www.runningcalendar.co.za/event/hollywoodbets-durban-10km/' },
  { title: 'Harbour Boat Cruise',           url: 'https://www.wilsonswharf.co.za' },
  { title: 'Durban Botanic Gardens',        url: 'https://www.durbanbotanicgardens.org.za' },
  { title: 'Hilton Arts Festival 2026',     url: 'https://tickets.computicket.com/search?q=Hilton+Arts+Festival' },
];

async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const resp = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeout);
    // 401/403/405/406/429 usually mean bot protection, not a dead event.
    const reachable = resp.ok || [401, 403, 405, 406, 429].includes(resp.status);
    return { reachable, status: resp.status, redirected: resp.redirected, finalUrl: resp.url };
  } catch {
    return { reachable: false, status: 0, redirected: false, finalUrl: url };
  }
}

async function cacheResult(title, url, status, suggestedUrl) {
  try {
    const { data: existing } = await supabase
      .from('ticket_verifications')
      .select('id')
      .eq('event_title', title)
      .eq('source_url', url)
      .single();

    const record = { event_title: title, source_url: url, status, suggested_url: suggestedUrl, checked_at: new Date().toISOString() };

    if (existing) {
      await supabase.from('ticket_verifications').update(record).eq('id', existing.id);
    } else {
      await supabase.from('ticket_verifications').insert(record);
    }
  } catch (err) {
    console.error('Cache error:', err);
  }
}

export default async function handler(req, res) {
  // Verify cron secret
  const auth = req.headers['authorization'];
  const isVercelCron = Boolean(req.headers['x-vercel-cron']) || /vercel-cron/i.test(req.headers['user-agent'] || '');
  if (!isVercelCron && (!auth || auth !== `Bearer ${CRON_SECRET}`)) {
    if (req.query?.secret !== CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  console.log('🔍 Cron: Starting daily social post and ticket verification...');
  const start = Date.now();

  // Start social publishing immediately, then verify the static links alongside it.
  const socialPromise = runDailyPost();
  const results = (await Promise.all(CITY_EVENTS.map(async event => {
    try {
      const check = await checkUrl(event.url);
      let status = 'verified';
      let suggestedUrl = null;

      if (!check.reachable) {
        status = 'dead';
        console.log(`  ⚠️  "${event.title}" — DEAD (${check.status || 'no response'})`);
      } else if (check.redirected) {
        status = 'redirected';
        suggestedUrl = check.finalUrl;
        console.log(`  🔀 "${event.title}" — Redirected → ${check.finalUrl}`);
      } else {
        console.log(`  ✅ "${event.title}" — OK (${check.status})`);
      }

      await cacheResult(event.title, event.url, status, suggestedUrl);
      return { title: event.title, status, url: suggestedUrl || event.url };
    } catch (err) {
      console.error(`  ❌ "${event.title}" — Error:`, err.message);
      return null;
    }
  }))).filter(Boolean);

  const social = await socialPromise;
  const duration = ((Date.now() - start) / 1000).toFixed(1);
  const verified = results.filter(r => r.status === 'verified').length;
  const dead = results.filter(r => r.status === 'dead').length;

  console.log(`\n✅ Cron complete: ${results.length} checked, ${verified} verified, ${dead} dead (${duration}s)`);

  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    summary: { total: results.length, verified, dead, redirected: results.filter(r => r.status === 'redirected').length },
    results,
    social,
    duration: `${duration}s`,
  });
}