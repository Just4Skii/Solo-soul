/**
 * Gemini Ticket Link Verification
 * /api/tickets/verify — Check if external ticket links are still valid
 * Solo Soul Experiences — 2026-07-16
 *
 * Uses Gemini AI to verify ticket URLs and suggest replacements for dead links.
 * Results cached in Supabase ticket_verifications table (24h TTL).
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iinvfedcrkibnftzbrlz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAw6-NI38aZw-u1Ukrb7WWdy1xye81jW3k';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ── City events that need verification ───────────────────
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

// ── Check if a URL is actually reachable ─────────────────
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

// ── Use Gemini to verify and search for a replacement ────
async function geminiVerify(title, url) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip markdown code blocks if present
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

// ── Cache verification in Supabase ───────────────────────
async function cacheVerification(title, url, status, suggestedUrl) {
  try {
    // Upsert — replace if same event+url combo exists
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

// ── Main handler ─────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const results = [];

    for (const event of CITY_EVENTS) {
      // Step 1: Check if URL is reachable
      const check = await checkUrl(event.url);

      let status = 'verified';
      let suggestedUrl = null;
      let notes = '';

      if (!check.reachable) {
        // Step 2: If dead, use Gemini to find replacement
        const ai = await geminiVerify(event.title, event.url);
        status = ai.status === 'verified' ? 'verified' : 'dead';
        suggestedUrl = ai.suggestedUrl;
        notes = ai.notes || `HTTP ${check.status}`;
      } else if (check.redirected) {
        status = 'redirected';
        suggestedUrl = check.finalUrl;
        notes = `Redirected to ${check.finalUrl}`;
      }

      // Cache result
      await cacheVerification(event.title, event.url, status, suggestedUrl);

      results.push({
        title: event.title,
        originalUrl: event.url,
        status,
        effectiveUrl: suggestedUrl || event.url,
        notes: notes || `Reachable (HTTP ${check.status})`,
      });
    }

    return res.json({ verified: true, timestamp: new Date().toISOString(), results });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: err.message || 'Verification failed' });
  }
}