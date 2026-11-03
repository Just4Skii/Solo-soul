/**
 * Live Durban event aggregator.
 * Pulls public listings from multiple event sites, normalises them and keeps
 * only future, Durban-area events relevant to Solo Soul's offering.
 * Nothing is invented: failed/empty sources are reported in `sources`.
 */
import { eventSlug } from '../lib/slug.js';
import { annotateEvents } from '../lib/editorial.js';

const CACHE_TTL_MS = 15 * 60 * 1000;
let cache = { at: 0, payload: null };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const AREA = /durban|umhlanga|westville|pinetown|hillcrest|berea|morningside|glenwood|ballito|kwazulu-natal|kzn/i;
const OUTSIDE = /cape town|western cape|johannesburg|gauteng|pretoria|soweto|gqeberha|port elizabeth|bloemfontein|free state|mpumalanga|limpopo|north west/i;
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const MAX_FUTURE_MS = 3 * 365 * 864e5;

/**
 * Webtickets date strings are inconsistent:
 *   "07 - 08 November 2026", "25 November - 29 November",
 *   "13 & 16 December 2026", "3rd Dec 2026 - 10th Jan 2027",
 *   "From 04 Nov 2026 19:00".
 * Parse the first date, treating times as SAST. If no year is present,
 * use the current year and roll forward when that date has already passed.
 */
function parseListingDate(raw) {
  const now = new Date();
  const text = String(raw || '').replace(/^from\s+/i, '').trim();
  if (!text) return null;

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T${iso[4] || '12'}:${iso[5] || '00'}:00+02:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const m = text.match(/^(\d{1,2})(?:st|nd|rd|th)?(?:\s*[-–&]\s*\d{1,2}(?:st|nd|rd|th)?)?\s+([A-Za-z]+)\.?\s*(\d{4})?(?:\s+(\d{1,2}):(\d{2}))?/i);
  if (!m) return null;
  const day = Number(m[1]);
  const month = MONTHS[m[2].slice(0, 3).toLowerCase()];
  if (month == null) return null;
  const year = m[3] ? Number(m[3]) : now.getFullYear();
  const hour = m[4] ? Number(m[4]) : 12;
  const minute = m[5] ? Number(m[5]) : 0;
  const build = y => new Date(`${y}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+02:00`);
  let d = build(year);
  if (!m[3] && d.getTime() < now.getTime() - 864e5) d = build(year + 1);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dateLabel(date) {
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Johannesburg' });
}

const CATEGORY_RULES = [
  ['wellness', /wellness|healing|meditat|breath|yoga|pilates|sound bath|journal|mindful|self[- ]care|therapy|spa/i],
  ['food', /brunch|coffee|wine|tasting|food|cook|chef|dinner|lunch|picnic|restaurant|culinary|beaujolais/i],
  ['music', /live music|concert|jazz|band|musical|music|festival|r&b|amapiano|hip[- ]hop|house music|orchestra|symphony|choir|recital/i],
  ['creative', /art|paint|pottery|craft|poetry|photograph|film|theatre|theater|drama|comedy|stand[- ]?up|improv|exhibition|gallery|opera|ballet|circus|puppet|design|creative/i],
  ['outdoors', /hike|walk|trail|beach|nature|garden|sunset|sunrise|surf|kayak|outdoor/i],
  ['markets', /market|flea|makers|bazaar|pop[- ]up/i],
  ['fitness', /run|race|marathon|(?<!and )half|10km|15km|5km|athletics|stadium|fitness|cycle|triathlon|gym/i],
  ['social', /network|connect|social|singles|meetup|club|comedy|games|community|worship|camp|jol|party/i],
  ['learning', /workshop|talk|seminar|masterclass|business|learn|course|conference|lecture/i],
  ['luxury', /luxury|yacht|premium|champagne|exclusive/i],
];

function classify(title, description = '', fallback = 'social', venue = '') {
  for (const [category, re] of CATEGORY_RULES) if (re.test(title || '')) return category;
  for (const [category, re] of CATEGORY_RULES) if (re.test(description || '')) return category;
  for (const [category, re] of CATEGORY_RULES) if (re.test(venue || '')) return category;
  return fallback;
}

function walkEvents(node, out) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach(n => walkEvents(n, out)); return; }
  const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
  if (types.includes('Event') && node.name && node.startDate) out.push(node);
  for (const value of Object.values(node)) if (value && typeof value === 'object') walkEvents(value, out);
}

function parseJsonLd(html) {
  const events = [];
  for (const [, raw] of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walkEvents(JSON.parse(raw.trim()), events); } catch { /* ignore malformed blocks */ }
  }
  return events;
}

function locationText(event) {
  const loc = event.location || {};
  const address = loc.address || {};
  const locality = [address.addressLocality, address.addressRegion].filter(Boolean).join(', ');
  return [loc.name, locality || address.streetAddress].filter(Boolean).join(', ');
}

function priceText(event) {
  const offers = (Array.isArray(event.offers) ? event.offers : [event.offers]).filter(Boolean);
  if (!offers.length) return 'See listing';

  const prices = offers
    .map(offer => (offer.price != null ? Number(offer.price) : null))
    .filter(value => Number.isFinite(value));
  if (prices.length) {
    const positive = prices.filter(value => value > 0);
    if (!positive.length) return 'FREE';
    const min = Math.min(...positive);
    const max = Math.max(...positive);
    const currency = offers.find(offer => offer.priceCurrency)?.priceCurrency;
    const prefix = currency === 'ZAR' || !currency ? 'R' : '';
    return min === max ? `${prefix}${min}` : `From ${prefix}${min}`;
  }

  const low = offers.find(offer => offer.lowPrice != null);
  if (low) {
    const prefix = low.priceCurrency === 'ZAR' || !low.priceCurrency ? 'R' : '';
    return `From ${prefix}${low.lowPrice}`;
  }
  return 'See listing';
}

function imageUrl(value) {
  const raw = Array.isArray(value) ? value[0] : (typeof value === 'string' ? value : value?.url);
  if (!raw) return '';
  if (String(raw).startsWith('//')) return `https:${raw}`;
  return String(raw);
}

function normalise(event, source, categoryHint) {
  const start = new Date(event.startDate);
  if (Number.isNaN(start.getTime())) return null;
  const end = event.endDate ? new Date(event.endDate) : null;
  const venue = locationText(event);
  if (!AREA.test(venue) || OUTSIDE.test(venue)) return null;
  const title = String(event.name).replace(/\s+/g, ' ').trim();
  if (!title) return null;
  const detectedPrice = priceText(event);
  // Quicket list pages sometimes expose a zero-price offer while the event
  // detail page has paid tiers. Do not advertise a false "FREE" unless the
  // listing itself says it is free.
  const price = source === 'Quicket' && detectedPrice === 'FREE' && !/free/i.test(`${title} ${event.description || ''}`)
    ? 'See listing'
    : detectedPrice;
  return {
    id: `ext-${source}-${Buffer.from((event.url || title) + start.toISOString()).toString('base64url').slice(0, 18)}`,
    title,
    start: start.toISOString(),
    dateLabel: start.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Johannesburg' }),
    venue,
    area: (venue.match(AREA) || ['Durban'])[0].replace(/^kzn$/i, 'Durban'),
    price,
    url: event.url || '',
    image: imageUrl(event.image),
    category: classify(title, event.description || '', categoryHint || 'social', venue),
    source,
    external: true,
  };
}

async function fetchJsonLd(name, url, categoryHint, requireArea = true, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, signal: controller.signal });
    if (!res.ok) return { name, ok: false, status: res.status, events: [] };
    const events = parseJsonLd(await res.text()).map(e => normalise(e, name, categoryHint)).filter(Boolean);
    return { name, ok: true, status: res.status, events };
  } catch (error) {
    return { name, ok: false, status: 0, error: error.name === 'AbortError' ? 'timeout' : 'fetch failed', events: [] };
  } finally { clearTimeout(timer); }
}

async function fetchEventbrite() {
  // Keep this deliberately small: Eventbrite rate-limits directory pages
  // aggressively, and the local listings repeat across category pages.
  const feeds = [
    ['art/', 'creative'],
    ['food-and-drink/', 'food'],
    ['networking/', 'social'],
  ];
  const results = await Promise.all(feeds.map(([suffix, category]) =>
    fetchJsonLd('Eventbrite', `https://www.eventbrite.com/d/south-africa--durban/${suffix}`, category, true, 7000)
  ));
  const events = results.flatMap(r => r.events || []);
  const ok = results.some(r => r.ok);
  const errors = results.filter(r => !r.ok).map(r => `${r.status || 'error'}`).join(', ');
  return { name: 'Eventbrite', ok, status: ok ? 200 : 0, events, error: errors || null };
}

const quicketImageCache = new Map();

async function upgradeQuicketImage(event) {
  if (!event.url || !event.image || !event.image.includes('_247_247')) return;
  if (quicketImageCache.has(event.url)) {
    event.image = quicketImageCache.get(event.url);
    return;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(event.url, {
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      signal: controller.signal,
    });
    if (!res.ok) return;
    const html = await res.text();
    const bannerTag = html.match(/<img[^>]*class=["'][^"']*banner-img[^"']*["'][^>]*>/i);
    const bannerSrc = bannerTag?.[0].match(/src=["']([^"']+)["']/i)?.[1];
    if (!bannerSrc) return;
    const image = bannerSrc.startsWith('//') ? `https:${bannerSrc}` : bannerSrc;
    if (/_0\.(jpe?g|png|webp)(\?|$)/i.test(image)) {
      quicketImageCache.set(event.url, image);
      event.image = image;
    }
  } catch { /* keep the thumbnail if the detail page is slow */ }
  finally { clearTimeout(timer); }
}

async function fetchQuicket() {
  // Quicket paginates 20 events per page and does not expose a Durban-only
  // feed. Read the national pages, then let normalise() keep KZN listings.
  const urls = ['https://www.quicket.co.za/events/'];
  for (let page = 2; page <= 20; page++) urls.push(`https://www.quicket.co.za/events/south-africa/${page}/`);
  const results = await Promise.all(urls.map(url =>
    fetchJsonLd('Quicket', url, 'social', true, 7000)
  ));
  const events = results.flatMap(r => r.events || []);
  await Promise.all(events.map(event => upgradeQuicketImage(event)));
  return { name: 'Quicket', ok: results.some(r => r.ok), status: 200, events };
}

async function fetchWebtickets() {
  // Search pages only expose the first slice; the KZN landing pages include
  // theatre, festivals and one-off events that the Durban search misses.
  const pages = [
    'https://www.webtickets.co.za/v2/search.aspx?search=Durban',
    'https://www.webtickets.co.za/v2/search.aspx?search=Umhlanga',
    'https://www.webtickets.co.za/v2/?city=kwazulu-natal',
    'https://www.webtickets.co.za/v2/category.aspx?city=kwazulu-natal&when=anytime',
    'https://www.webtickets.co.za/v2/search.aspx?search=KwaZulu-Natal',
  ];
  const results = await Promise.all(pages.map(async url => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, signal: controller.signal });
      if (!res.ok) return { ok: false, events: [] };
      const html = await res.text();
      const cards = html.split('product-card-thumb').slice(1);
      const events = [];
      for (const card of cards) {
        const link = card.match(/href="(event\.aspx\?itemid=\d+)"[^>]*>[\s\S]*?<h3[^>]*product-card-title[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
        const meta = card.match(/product-card-meta[^>]*>\s*([^<]+)</i);
        const venue = card.match(/product-card-category[\s\S]*?<li>([^<]+)<\/li>/i);
        if (!link || !meta) continue;
        const start = parseListingDate(meta[1]);
        if (!start || start.getTime() > Date.now() + MAX_FUTURE_MS) continue;
        const title = link[2].replace(/\s+/g, ' ').replace(/&amp;/g, '&').trim();
        if (!title || /membership|season pass|gift card|voucher|permit|reservation|parking/i.test(title)) continue;
        const place = (venue ? venue[1] : '').replace(/&amp;/g, '&').trim() || 'Durban';
        if (!AREA.test(place)) continue;
        const imagePath = card.match(/<img\s+src="([^"]+)"/i)?.[1] || '';
        let image = imagePath
          ? (imagePath.startsWith('http') ? imagePath : imagePath.startsWith('//') ? `https:${imagePath}` : `https://www.webtickets.co.za/v2/${imagePath.replace(/^\/+/, '')}`)
          : '';
        // Webtickets list cards use 528px panel crops. The detail banner is
        // 750px and looks materially cleaner on the event page.
        if (image.includes('/panel_')) image = image.replace('/panel_', '/banner_');
        events.push({
          id: `ext-webtickets-${link[1].match(/\d+/)[0]}`,
          title,
          start: start.toISOString(),
          dateLabel: dateLabel(start),
          venue: place,
          area: (place.match(AREA) || ['Durban'])[0],
          price: 'See listing',
          url: `https://www.webtickets.co.za/v2/${link[1]}`,
          image,
          category: classify(title, '', 'social', place),
          source: 'Webtickets',
          external: true,
        });
      }
      return { ok: true, events };
    } catch {
      return { ok: false, events: [] };
    } finally {
      clearTimeout(timer);
    }
  }));

  const seen = new Set();
  const events = [];
  for (const result of results) {
    for (const event of result.events) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      events.push(event);
    }
  }
  return { name: 'Webtickets', ok: results.some(r => r.ok), status: 200, events };
}

async function fetchTicketmaster() {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) return { name: 'Ticketmaster', ok: false, skipped: true, events: [] };
  try {
    const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?city=Durban&countryCode=ZA&size=30&sort=date,asc&apikey=${encodeURIComponent(key)}`);
    if (!res.ok) return { name: 'Ticketmaster', ok: false, status: res.status, events: [] };
    const data = await res.json();
    const events = (data._embedded?.events || []).map(e => ({
      id: `ext-ticketmaster-${e.id}`,
      title: e.name,
      start: e.dates?.start?.dateTime || (e.dates?.start?.localDate ? `${e.dates.start.localDate}T19:00:00+02:00` : ''),
      dateLabel: e.dates?.start?.localDate ? new Date(`${e.dates.start.localDate}T12:00:00+02:00`).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Johannesburg' }) : '',
      venue: [e._embedded?.venues?.[0]?.name, e._embedded?.venues?.[0]?.city?.name].filter(Boolean).join(', '),
      area: 'Durban',
      price: e.priceRanges?.[0]?.min != null ? `From R${e.priceRanges[0].min}` : 'See listing',
      url: e.url,
      image: e.images?.find(i => i.ratio === '16_9')?.url || '',
      category: classify(e.name, '', 'social', e._embedded?.venues?.[0]?.name || ''),
      source: 'Ticketmaster',
      external: true,
    })).filter(e => e.start && e.title);
    return { name: 'Ticketmaster', ok: true, status: 200, events };
  } catch { return { name: 'Ticketmaster', ok: false, events: [] }; }
}

async function fetchFacebook() {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  const pages = (process.env.FACEBOOK_PAGE_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!token || !pages.length) return { name: 'Facebook', ok: false, skipped: true, events: [] };
  try {
    const results = await Promise.all(pages.map(async page => {
      const url = `https://graph.facebook.com/v19.0/${page}/events?fields=name,start_time,place,cover,description&limit=30&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).map(e => ({
        id: `ext-facebook-${e.id}`,
        title: e.name,
        start: e.start_time,
        dateLabel: new Date(e.start_time).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Johannesburg' }),
        venue: e.place?.name || 'Durban',
        area: 'Durban',
        price: 'See listing',
        url: `https://www.facebook.com/events/${e.id}`,
        image: e.cover?.source || '',
        category: classify(e.name, e.description || '', 'social', e.place?.name || ''),
        source: 'Facebook',
        external: true,
      }));
    }));
    return { name: 'Facebook', ok: true, status: 200, events: results.flat() };
  } catch { return { name: 'Facebook', ok: false, events: [] }; }
}

function publicPayload(payload, req) {
  const full = String(req.query?.full || '') === '1' || String(req.query?.full || '').toLowerCase() === 'true';
  const all = payload.events || [];
  const included = all.filter(event => event.curation?.included);
  const visible = full ? all : included;
  return {
    ...payload,
    events: visible.slice(0, 80),
    curation: {
      total: all.length,
      included: included.length,
      excluded: all.length - included.length,
      mode: full ? 'full' : 'curated',
    },
    full,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }

  if (cache.payload && Date.now() - cache.at < CACHE_TTL_MS) {
    return res.status(200).json({ ...publicPayload(cache.payload, req), cached: true });
  }

  const sources = await Promise.all([
    fetchEventbrite(),
    fetchQuicket(),
    fetchWebtickets(),
    fetchTicketmaster(),
    fetchFacebook(),
  ]);

  const since = Date.now() - 6 * 60 * 60 * 1000;
  const seen = new Map();
  const events = [];
  for (const source of sources) {
    for (const event of source.events || []) {
      const start = new Date(event.start).getTime();
      if (!start || start < since || start > Date.now() + MAX_FUTURE_MS) continue;
      const key = `${event.title.toLowerCase()}|${event.start.slice(0, 10)}`;
      if (seen.has(key)) {
        // The same listing can appear on several provider pages with different
        // price detail (Quicket sometimes exposes a zero-price card before the
        // real ticket price). Keep the more informative price/image.
        const existing = events[seen.get(key)];
        if ((existing.price === 'FREE' || existing.price === 'See listing') &&
            event.price && event.price !== 'FREE' && event.price !== 'See listing') {
          existing.price = event.price;
        }
        if (!existing.image && event.image) existing.image = event.image;
        continue;
      }
      seen.set(key, events.length);
      events.push(event);
    }
  }
  events.sort((a, b) => new Date(a.start) - new Date(b.start));
  for (const event of events) event.slug = eventSlug(event.title, event.start);

  const payload = {
    updatedAt: new Date().toISOString(),
    events: annotateEvents(events),
    sources: sources.map(s => ({ name: s.name, ok: Boolean(s.ok), count: (s.events || []).length, skipped: Boolean(s.skipped), error: s.error || null })),
  };
  cache = { at: Date.now(), payload };
  return res.status(200).json(publicPayload(payload, req));
}

export const config = { maxDuration: 60 };
