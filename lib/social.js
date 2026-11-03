/**
 * Daily Facebook content.
 * Picks one relevant upcoming Durban listing, checks both the Page feed and
 * our own publishing history for duplicates, validates the source link,
 * writes a fact-bound caption and posts to the Page.
 */
import { createClient } from '@supabase/supabase-js';
import { generateText, geminiConfigured } from './ai.js';
import { curateEvent } from './editorial.js';

const PAGE_ID = process.env.FACEBOOK_PAGE_IDS || '';
const TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || '';
const APP_URL = (process.env.APP_URL || 'https://ssoul.co.za').replace(/\/$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const HISTORY_DAYS = 90;
const DRY_RUN = /^(1|true)$/i.test(process.env.SOCIAL_DRY_RUN || '');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const PARTNER_DISCLOSURE = 'This is a partner listing. Tickets and details are with the organiser.';

function priceSentence(price) {
  const value = String(price || '').trim();
  if (!value || /^see listing$/i.test(value)) return 'Ticket price: check the listing.';
  if (/^free$/i.test(value)) return 'Free entry.';
  return `Tickets: ${value}.`;
}

/**
 * Read the Page's own posts. /{page-id}/feed requires pages_read_engagement;
 * the Page token we use for publishing can read /me/posts without it.
 */
async function pageFeed() {
  try {
    const url = `https://graph.facebook.com/v19.0/me/posts?fields=message,created_time&limit=25&access_token=${encodeURIComponent(TOKEN)}`;
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error?.message || 'Page feed unavailable', posts: [] };
    return { ok: true, posts: data.data || [] };
  } catch (error) {
    return { ok: false, error: error.message, posts: [] };
  }
}

async function recentHistory() {
  if (!supabase) return { ok: false, error: 'Supabase not configured', ids: new Set(), titles: [] };
  try {
    const since = new Date(Date.now() - HISTORY_DAYS * 864e5).toISOString();
    const { data, error } = await supabase
      .from('social_posts')
      .select('event_id,event_title,posted_at,event_snapshot')
      .eq('platform', 'facebook')
      .gte('posted_at', since)
      .order('posted_at', { ascending: false })
      .limit(200);
    if (error) return { ok: false, error: error.message, ids: new Set(), titles: [], categories: [] };
    const rows = data || [];
    return {
      ok: true,
      ids: new Set(rows.map(row => row.event_id).filter(Boolean)),
      titles: rows.map(row => String(row.event_title || '').toLowerCase()).filter(Boolean),
      categories: rows.map(row => row.event_snapshot?.category).filter(Boolean),
    };
  } catch (error) {
    return { ok: false, error: error.message, ids: new Set(), titles: [], categories: [] };
  }
}

async function validateSource(event) {
  if (!event.url) return { ok: false, error: 'No source URL' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(event.url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      signal: controller.signal,
    });
    // We only need the status line; do not download the provider page.
    res.body?.cancel().catch(() => {});
    if (res.status === 404 || res.status === 410 || res.status >= 500) {
      return { ok: false, status: res.status, error: `Source returned ${res.status}` };
    }
    return { ok: true, status: res.status, finalUrl: res.url };
  } catch (error) {
    return { ok: false, status: 0, error: error.name === 'AbortError' ? 'Source check timed out' : error.message };
  } finally {
    clearTimeout(timer);
  }
}

function editorialOpener(event) {
  const days = Math.max(0, (new Date(event.start).getTime() - Date.now()) / 864e5);
  if (/^free$/i.test(String(event.price || ''))) return 'A free one worth knowing about.';
  if (days <= 3) return 'Last chance to catch this one.';
  if (days <= 7) return 'This week’s pick.';
  if (event.category === 'creative') return 'Something a little different.';
  if (event.category === 'music') return 'A live one worth leaving the house for.';
  if (event.category === 'food') return 'A table worth booking.';
  if (event.category === 'outdoors') return 'A reason to get outside.';
  if (event.category === 'wellness') return 'A slower kind of plan.';
  return 'One for the diary.';
}

const WEEKDAY_THEMES = [
  ['outdoors', 'wellness'],
  ['wellness', 'food'],
  ['creative', 'learning'],
  ['food', 'markets'],
  ['outdoors', 'fitness'],
  ['music', 'social'],
  ['markets', 'creative', 'food'],
];

function dayThemes(now) {
  return WEEKDAY_THEMES[new Date(now).getDay()] || [];
}

function daysUntil(event, now) {
  return Math.max(0, (new Date(event.start).getTime() - now) / 864e5);
}

function angleFor(event, now) {
  const days = daysUntil(event, now);
  if (/^free$/i.test(String(event.price || ''))) return 'A free one worth knowing about.';
  if (days <= 3) return 'Last chance to catch this one.';
  if (days <= 7) return 'This week’s pick.';
  if (event.category === 'creative') return 'Something a little different.';
  if (event.category === 'music') return 'A live one worth leaving the house for.';
  if (event.category === 'food') return 'A table worth booking.';
  if (event.category === 'outdoors') return 'A reason to get outside.';
  if (event.category === 'wellness') return 'A slower kind of plan.';
  if (event.category === 'learning') return 'A useful way to spend an evening.';
  if (event.category === 'markets') return 'A weekend wander worth making.';
  return 'One for the diary.';
}

function cleanCaption(text) {
  return String(text || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .trim();
}

function buildPlan(event, now, history) {
  const days = Math.ceil(daysUntil(event, now));
  return {
    angle: angleFor(event, now),
    why: `${event.category || 'Durban'} listing in ${event.area || 'Durban'}, ${days === 1 ? '1 day' : `${days} days`} out`,
    themes: dayThemes(now),
    recentCategories: (history.categories || []).slice(0, 2),
  };
}

async function caption(event, shareUrl, plan = {}) {
  const siteUrl = shareUrl || `${APP_URL}/e/${encodeURIComponent(event.slug || event.id)}`;
  const facts = [
    `Event: ${event.title}`,
    `Date: ${event.dateLabel}`,
    `Venue: ${event.venue}`,
    `Price: ${priceSentence(event.price)}`,
    `Our page: ${siteUrl}`,
    `Source: ${event.source}`,
  ].join('\n');

  let geminiError = '';
  if (geminiConfigured()) {
    try {
      const { text, model } = await generateText(
        `Write a short Facebook caption recommending a third-party Durban event for Solo Soul Experiences. Solo Soul is only sharing the listing and does NOT host, organise or sell tickets for this event.

Use ONLY these facts. Never invent availability, discounts, ticket status, audience type or a solo-specific angle.
Use the editorial angle below. Do not force a different angle if the facts do not support it.
MANDATORY: include this exact sentence on its own line:
"${PARTNER_DISCLOSURE}"
Write one short paragraph, then the mandatory sentence, then the link, then 4 relevant Durban hashtags. Do not mention AI.
Do not say the event is solo-friendly, sold out, discounted or nearly full.

EDITORIAL BRIEF:
Today’s angle: ${plan.angle || editorialOpener(event)}
Why this listing: ${plan.why || 'A relevant upcoming Durban listing.'}
Write with a specific, human point of view. Avoid generic wellness language, fake urgency, and phrases like “you deserve” or “treat yourself”.
Return plain text only. Do not use Markdown asterisks, underscores or headings.
${facts}`,
        { maxOutputTokens: 350 }
      );
      const cleaned = cleanCaption(text);
      const complete = cleaned
        && cleaned.length > 120
        && cleaned.includes(siteUrl)
        && cleaned.toLowerCase().includes(event.title.toLowerCase().slice(0, 18))
        && /partner listing/i.test(cleaned)
        && /organi[sz]er/i.test(cleaned)
        && !/solo[- ]friendly|perfect for solo|designed for solo|sold out|nearly full|discount/i.test(cleaned)
        && !(/free (entry|admission|tickets?)|tickets? (are )?free/i.test(cleaned) && !/^free$/i.test(String(event.price || '')))
        && !/solo soul (hosts|organises|runs)/i.test(cleaned);
      if (complete) return { text: cleaned, model, fallback: false };
      geminiError = 'Generated caption failed fact validation';
    } catch (error) {
      geminiError = error.message;
    }
  }

  const opener = plan.angle || editorialOpener(event);
  return {
    text: `${opener}\n\n${event.title} on ${event.dateLabel} at ${event.venue}.\n\n${priceSentence(event.price)}\n\n${PARTNER_DISCLOSURE}\n\n${siteUrl}\n\n#DurbanEvents #Durban #WhatsOnDurban #KwaZuluNatal`,
    model: null,
    fallback: true,
    ...(geminiError ? { geminiError } : {}),
  };
}

async function recordPost(event, postId) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  const snapshot = {
    id: event.id,
    title: event.title,
    dateLabel: event.dateLabel,
    start: event.start,
    venue: event.venue,
    area: event.area,
    price: event.price,
    url: event.url,
    image: event.image,
    source: event.source,
    category: event.category,
    slug: event.slug,
  };
  try {
    const { error } = await supabase.from('social_posts').upsert({
      platform: 'facebook',
      event_id: event.id,
      event_title: event.title,
      slug: event.slug || null,
      post_id: postId || null,
      event_snapshot: snapshot,
    }, { onConflict: 'platform,event_id', ignoreDuplicates: true });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function rank(event, now, preferred = []) {
  const priority = ['wellness', 'creative', 'food', 'outdoors', 'music', 'luxury', 'fitness', 'markets', 'social', 'learning'];
  const index = priority.indexOf(event.category);
  const categoryWeight = index === -1 ? priority.length : index;
  const days = Math.max(0, (new Date(event.start).getTime() - now) / 864e5);
  // Keep the brand mix, but let an imminent event beat a slightly better category.
  let score = categoryWeight * 2 + Math.min(days, 21) / 7;
  if (preferred.includes(event.category)) score -= 5;
  return score;
}

export async function runDailyPost({ dryRun = DRY_RUN } = {}) {
  if (!PAGE_ID || !TOKEN) return { ok: false, error: 'Facebook Page not configured' };
  try {
    const feedRes = await fetch(`${APP_URL}/api/events`);
    if (!feedRes.ok) return { ok: false, error: `Event feed returned ${feedRes.status}` };
    const feed = await feedRes.json();
    const now = Date.now();
    const upcoming = (feed.events || []).filter(e => {
      const start = new Date(e.start).getTime();
      return start > now && start < now + 21 * 864e5;
    });
    if (!upcoming.length) return { ok: true, skipped: 'No upcoming events in the next 21 days' };

    const recent = await pageFeed();
    const history = await recentHistory();
    if (!recent.ok) console.warn(`Facebook Page feed unavailable: ${recent.error}`);
    if (!history.ok) console.warn(`Social post history unavailable: ${history.error}`);
    if (!recent.ok && !history.ok) {
      return { ok: false, error: `Duplicate check unavailable: ${recent.error || history.error}` };
    }

    const postedText = [
      ...(recent.posts || []).map(post => String(post.message || '').toLowerCase()),
      ...(history.titles || []),
    ].join('\n');
    const partnerOnly = upcoming.filter(e => e.source && e.source !== 'Solo Soul' && String(e.id || '').startsWith('ext-'));
    const themes = dayThemes(now);
    const ranking = partnerOnly
      .map(e => ({ ...e, curation: e.curation || curateEvent(e) }))
      .filter(e => e.curation.included)
      .filter(e => !history.ids.has(e.id) && !postedText.includes(e.title.toLowerCase().slice(0, 30)))
      .map(e => ({
        event: e,
        score: rank(e, now, themes) + ((history.categories || []).includes(e.category) ? 2 : 0),
      }))
      .sort((a, b) => a.score - b.score);
    const onBrand = ranking.map(row => row.event);
    if (!onBrand.length) return { ok: true, skipped: 'No unposted partner events available' };

    // Verify a small number of candidates immediately before publishing.
    let event = null;
    let validation = null;
    for (const candidate of onBrand.slice(0, 8)) {
      const check = await validateSource(candidate);
      if (check.ok) { event = candidate; validation = check; break; }
      console.warn(`Skipping ${candidate.title}: ${check.error || check.status}`);
    }
    if (!event) return { ok: true, skipped: 'No partner events passed source-link validation' };

    const plan = buildPlan(event, now, history);
    const shareUrl = `${APP_URL}/e/${encodeURIComponent(event.slug || event.id)}?utm_source=facebook&utm_medium=social&utm_campaign=daily_event`;
    const copy = await caption(event, shareUrl, plan);
    const message = copy.text;
    if (dryRun) {
      return {
        ok: true,
        dryRun: true,
        posted: false,
        event: event.title,
        message,
        shareUrl,
        editorial: plan,
        copy: { model: copy.model, fallback: copy.fallback },
        source_status: validation?.status,
        duplicateSources: { pageFeed: recent.ok, history: history.ok },
      };
    }
    const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, link: shareUrl, access_token: TOKEN }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error?.message || 'Facebook post failed', event: event.title };

    const persisted = await recordPost(event, data.id);
    if (!persisted.ok) console.error(`Facebook post ${data.id} was not recorded in social_posts: ${persisted.error}`);
    return {
      ok: true,
      posted: true,
      event: event.title,
      post_id: data.id,
      source_status: validation?.status,
      editorial: plan,
      copy: { model: copy.model, fallback: copy.fallback },
      persisted: persisted.ok,
      ...(persisted.ok ? {} : { persistence_error: persisted.error }),
    };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
