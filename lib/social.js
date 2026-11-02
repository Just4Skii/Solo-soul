/**
 * Daily Facebook content.
 * Picks one relevant upcoming Durban listing, checks the Page feed for duplicates,
 * writes a fact-bound caption with Gemini (fallback template) and posts to the Page.
 */
import { generateText, geminiConfigured } from './ai.js';

const PAGE_ID = process.env.FACEBOOK_PAGE_IDS || '';
const TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const APP_URL = (process.env.APP_URL || 'https://ssoul.co.za').replace(/\/$/, '');

async function pageFeed() {
  const url = `https://graph.facebook.com/v19.0/${PAGE_ID}/feed?fields=message,created_time&limit=15&access_token=${encodeURIComponent(TOKEN)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return data.data || [];
}

async function caption(event) {
  const facts = `Event: ${event.title}\nDate: ${event.dateLabel}\nVenue: ${event.venue}\nPrice: ${event.price}\nLink: ${event.url}\nSource: ${event.source}`;
  if (geminiConfigured()) {
    try {
      const { text } = await generateText(
        `Write a warm, grounded Facebook caption for Solo Soul Experiences in Durban. Use ONLY these facts, never invent details. One short paragraph, then a line inviting the reader to come alone. End with the link and 4 relevant hashtags. Do not mention AI.\n\n${facts}`,
        { maxOutputTokens: 350 }
      );
      if (text) return text;
    } catch { /* fall back below */ }
  }
  return `A little time for your own company.\n\n${event.title} — ${event.dateLabel} at ${event.venue}. ${event.price}.\n\nCome alone. Leave with a little more of yourself.\n\n${event.url}\n\n#SoloSoulExperiences #Durban #SoloDate #DurbanEvents`;
}

export async function runDailyPost() {
  if (!PAGE_ID || !TOKEN) return { ok: false, error: 'Facebook Page not configured' };
  try {
    const feed = await fetch(`${APP_URL}/api/events`).then(r => r.json());
    const now = Date.now();
    const upcoming = (feed.events || []).filter(e => new Date(e.start).getTime() > now && new Date(e.start).getTime() < now + 21 * 864e5);
    if (!upcoming.length) return { ok: true, skipped: 'No upcoming events in the next 21 days' };

    const recent = await pageFeed();
    const postedText = recent.map(p => (p.message || '').toLowerCase()).join('\n');
    const onBrand = upcoming.filter(e => !/seminar|conference|church|worship|business|expo|job fair/i.test(e.title));
    const event = (onBrand.length ? onBrand : upcoming).find(e => !postedText.includes(e.title.toLowerCase().slice(0, 30)));
    if (!event) return { ok: true, skipped: 'All upcoming events already posted recently' };

    const message = await caption(event);
    const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, link: event.url, access_token: TOKEN }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error?.message || 'Facebook post failed', event: event.title };
    return { ok: true, posted: true, event: event.title, post_id: data.id };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
