/**
 * Gemini Ticket Link Verification
 * /api/tickets/verify — Public GET returns cached verifications from Supabase.
 * Live outbound checks + Gemini AI + DB cache writes require Admin JWT or CRON_SECRET.
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { generateText, geminiConfigured } from '../../lib/ai.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || '';
const CRON_SECRET = process.env.CRON_SECRET || '';

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

function isAuthorizedVerifier(req) {
  const auth = String(req.headers['authorization'] || '');
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  if (CRON_SECRET) {
    const a = Buffer.from(token);
    const b = Buffer.from(CRON_SECRET);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  }
  if (JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      if (decoded && ['admin', 'superadmin'].includes(decoded.role)) return true;
    } catch { /* ignore */ }
  }
  return false;
}

async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeout);
    return { reachable: resp.ok, status: resp.status, redirected: resp.redirected, finalUrl: resp.url };
  } catch {
    return { reachable: false, status: 0, redirected: false, finalUrl: url };
  }
}

async function geminiVerify(title, url) {
  if (!geminiConfigured()) return { status: 'uncertain', suggestedUrl: null, notes: 'Gemini API key not configured', confidence: 0 };
  const prompt = `You are a ticket verification assistant for Solo Soul Experiences in Durban, South Africa.

I need you to verify this event ticket link:
Event: "${title}"
URL: ${url}

1. First, check if the URL looks correct for this event
2. If the link might be dead, suggest the correct ticket buying URL
3. Respond with ONLY a JSON object (no markdown, no backticks):

{
  "status": "verified" or "dead" or "uncertain",
  "confidence": 0-100,
  "notes": "brief reason",
  "suggestedUrl": "suggested replacement URL or null if the original looks correct"
}`;

  try {
    const { text } = await generateText(prompt, { temperature: 0.2, maxOutputTokens: 300 });
    const json = JSON.parse(text.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim());
    return {
      status: json.status || 'uncertain',
      suggestedUrl: json.suggestedUrl || null,
      notes: json.notes || '',
      confidence: json.confidence || 0,
    };
  } catch (err) {
    console.error(`Gemini verify error for "${title}":`, err);
    return { status: 'uncertain', suggestedUrl: null, notes: 'AI verification failed', confidence: 0 };
  }
}

async function cacheVerification(title, url, status, suggestedUrl) {
  try {
    const existing = await supabase
      .from('ticket_verifications')
      .select('id')
      .eq('event_title', title)
      .eq('source_url', url)
      .single();

    const record = { event_title: title, source_url: url, status, suggested_url: suggestedUrl, checked_at: new Date().toISOString() };

    if (existing.data) {
      await supabase.from('ticket_verifications').update(record).eq('id', existing.data.id);
    } else {
      await supabase.from('ticket_verifications').insert(record);
    }
  } catch (err) {
    console.error('Cache error:', err);
  }
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const allowedOrigin = process.env.APP_ORIGIN || 'https://ssoul.co.za';
  if (req.headers.origin && req.headers.origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Public GET requests return cached verification records without running live HTTP/Gemini checks
    if (req.method === 'GET' && !isAuthorizedVerifier(req)) {
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=900');
      const { data: cached } = await supabase
        .from('ticket_verifications')
        .select('event_title, source_url, status, suggested_url, checked_at')
        .order('checked_at', { ascending: false });

      const byTitle = new Map((cached || []).map(row => [row.event_title, row]));
      const results = CITY_EVENTS.map(ev => {
        const row = byTitle.get(ev.title);
        return {
          title: ev.title,
          originalUrl: ev.url,
          status: row?.status || 'verified',
          effectiveUrl: row?.suggested_url || ev.url,
          notes: row ? `Checked ${row.checked_at}` : 'Cached listing',
        };
      });
      return res.json({ verified: true, cached: true, timestamp: new Date().toISOString(), results });
    }

    // Active verification requires admin JWT or CRON_SECRET
    if (!isAuthorizedVerifier(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.setHeader('Cache-Control', 'no-store');
    const results = [];

    for (const event of CITY_EVENTS) {
      const check = await checkUrl(event.url);
      let status = 'verified';
      let suggestedUrl = null;
      let notes = '';

      if (!check.reachable) {
        const ai = await geminiVerify(event.title, event.url);
        status = ai.status === 'verified' ? 'verified' : 'dead';
        suggestedUrl = ai.suggestedUrl;
        notes = ai.notes || `HTTP ${check.status}`;
      } else if (check.redirected) {
        status = 'redirected';
        suggestedUrl = check.finalUrl;
        notes = `Redirected to ${check.finalUrl}`;
      }

      await cacheVerification(event.title, event.url, status, suggestedUrl);

      results.push({
        title: event.title,
        originalUrl: event.url,
        status,
        effectiveUrl: suggestedUrl || event.url,
        notes: notes || `Reachable (HTTP ${check.status})`,
      });
    }

    return res.json({ verified: true, cached: false, timestamp: new Date().toISOString(), results });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
