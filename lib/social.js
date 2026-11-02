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
  const siteUrl = `${APP_URL}/e/${encodeURIComponent(event.slug || event.id)}`;
  const facts = `Event: ${event.title}\nDate: ${event.dateLabel}\nVenue: ${event.venue}\nPrice: ${event.price}\nOur page: ${siteUrl}\nSource: ${event.source}`;
  if (geminiConfigured()) {
    try {
      const { text } = await generateText(
        `Write a short Facebook caption recommending a third-party Durban event. Solo Soul is only sharing the listing and does NOT host or run this event. Use ONLY these facts, never invent details. Do not say Solo Soul hosts it. One short paragraph, then a line saying tickets and details are with the organiser. End with the link and 4 relevant Durban hashtags. Do not mention AI.\n\n${facts}`,
        { maxOutputTokens: 350 }
      );
      const complete = text && text.length > 100 && text.includes(siteUrl) && text.toLowerCase().includes(event.title.toLowerCase().slice(0, 18));
      if (complete) return text;
    } catch { /* fall back below */ }
  }
  return `Durban, this one looks good.\n\n${event.title} — ${event.dateLabel} at ${event.venue}. ${event.price}.\n\nHosted by the organiser; tickets and final details are with them.\n\n${siteUrl}\n\n#DurbanEvents #Durban #WhatsOnDurban #KwaZuluNatal`;
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
    const priority = ['wellness','creative','food','outdoors','music','luxury','fitness','markets','social','learning'];
    const partnerOnly = upcoming.filter(e => e.source && e.source !== 'Solo Soul' && String(e.id || '').startsWith('ext-'));
    const onBrand = partnerOnly
      .filter(e => !/seminar|conference|church|worship|business|expo|job fair|hirsch/i.test(e.title))
      .sort((a, b) => priority.indexOf(a.category) - priority.indexOf(b.category));
    const event = (onBrand.length ? onBrand : upcoming).find(e => !postedText.includes(e.title.toLowerCase().slice(0, 30)));
    if (!event) return { ok: true, skipped: 'All upcoming events already posted recently' };

    const message = await caption(event);
    const shareUrl = `${APP_URL}/e/${encodeURIComponent(event.slug || event.id)}`;
    const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, link: shareUrl, access_token: TOKEN }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error?.message || 'Facebook post failed', event: event.title };
    return { ok: true, posted: true, event: event.title, post_id: data.id };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
