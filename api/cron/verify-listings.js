/**
 * Cron Job: Verify All Ticket Listings
 * /api/cron/verify-listings — Runs every 12 hours via Vercel Cron
 * Solo Soul Experiences — 2026-07-16
 *
 * This is triggered by a cron: "0 */12 * * *" schedule in vercel.json.
 * It checks all external ticket links and updates the database with results.
 *
 * CRON_SECRET must match the value in vercel.json to prevent unauthorized runs.
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iinvfedcrkibnftzbrlz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAw6-NI38aZw-u1Ukrb7WWdy1xye81jW3k';
const CRON_SECRET = process.env.CRON_SECRET || 'solo-soul-cron-secret-2026';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeout);
    return { reachable: resp.ok, status: resp.status, redirected: resp.redirected, finalUrl: resp.url };
  } catch {
    return { reachable: false, status: 0, redirected: false, finalUrl: url };
  }
}

async function geminiVerify(title, url) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `You are a ticket verification assistant for Solo Soul Experiences in Durban, South Africa.

Verify this event ticket link:
Event: "${title}"
URL: ${url}

Respond ONLY with JSON:
{
  "status": "verified" or "dead" or "uncertain",
  "suggestedUrl": "replacement URL or null",
  "notes": "brief reason"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return JSON.parse(text.replace(/```json?\s*/i, '').replace(/```\s*$/, '').trim());
  } catch {
    return { status: 'uncertain', suggestedUrl: null, notes: 'AI error' };
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
  if (!auth || auth !== `Bearer ${CRON_SECRET}`) {
    // Also allow the cron secret in query params for Vercel Cron
    if (req.query?.secret !== CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  console.log('🔍 Cron: Starting ticket verification run...');
  const start = Date.now();
  const results = [];

  for (const event of CITY_EVENTS) {
    try {
      const check = await checkUrl(event.url);
      let status = 'verified';
      let suggestedUrl = null;

      if (!check.reachable) {
        const ai = await geminiVerify(event.title, event.url);
        status = ai.status || 'dead';
        suggestedUrl = ai.suggestedUrl || null;
        console.log(`  ⚠️  "${event.title}" — DEAD → ${suggestedUrl || 'no replacement found'}`);
      } else if (check.redirected) {
        status = 'redirected';
        suggestedUrl = check.finalUrl;
        console.log(`  🔀 "${event.title}" — Redirected → ${check.finalUrl}`);
      } else {
        console.log(`  ✅ "${event.title}" — OK (${check.status})`);
      }

      await cacheResult(event.title, event.url, status, suggestedUrl);
      results.push({ title: event.title, status, url: suggestedUrl || event.url });
    } catch (err) {
      console.error(`  ❌ "${event.title}" — Error:`, err.message);
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  const verified = results.filter(r => r.status === 'verified').length;
  const dead = results.filter(r => r.status === 'dead').length;

  console.log(`\n✅ Cron complete: ${results.length} checked, ${verified} verified, ${dead} dead (${duration}s)`);

  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    summary: { total: results.length, verified, dead, redirected: results.filter(r => r.status === 'redirected').length },
    results,
    duration: `${duration}s`,
  });
}