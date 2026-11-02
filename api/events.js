/**
 * Live Durban event aggregator.
 * Pulls public listings from multiple event sites, normalises them and keeps
 * only future, Durban-area events relevant to Solo Soul's offering.
 * Nothing is invented: failed/empty sources are reported in `sources`.
 */
const CACHE_TTL_MS = 15 * 60 * 1000;
let cache = { at: 0, payload: null };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const AREA = /durban|umhlanga|westville|pinetown|hillcrest|berea|morningside|glenwood|ballito|kwazulu-natal|kzn/i;
const OUTSIDE = /cape town|western cape|johannesburg|gauteng|pretoria|soweto|gqeberha|port elizabeth|bloemfontein|free state|mpumalanga|limpopo|north west/i;

const CATEGORY_RULES = [
  ['wellness', /wellness|healing|meditat|breath|yoga|sound bath|journal|mindful|self[- ]care|therapy|spa/i],
  ['food', /brunch|coffee|wine|tasting|food|cook|chef|dinner|lunch|picnic|restaurant|culinary/i],
  ['music', /live music|concert|jazz|band|musical|music|festival|r&b|amapiano|hip[- ]hop|house music/i],
  ['creative', /art|paint|pottery|craft|poetry|photograph|film|theatre|design|creative/i],
  ['outdoors', /hike|walk|trail|beach|nature|garden|sunset|sunrise|surf|kayak|outdoor/i],
  ['markets', /market|flea|makers|bazaar|pop[- ]up/i],
  ['fitness', /run|race|fitness|cycle|pilates|gym/i],
  ['social', /network|connect|social|singles|meetup|club|comedy|games|community/i],
  ['learning', /workshop|talk|seminar|masterclass|business|learn|course|conference/i],
  ['luxury', /luxury|yacht|premium|champagne|exclusive/i],
];

function classify(title, description = '', fallback = 'social') {
  for (const [category, re] of CATEGORY_RULES) if (re.test(title || '')) return category;
  for (const [category, re] of CATEGORY_RULES) if (re.test(description || '')) return category;
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
  const offers = Array.isArray(event.offers) ? event.offers[0] : event.offers;
  if (!offers) return 'See listing';
  if (offers.price === 0 || offers.price === '0') return 'FREE';
  if (offers.price != null) return `${offers.priceCurrency === 'ZAR' ? 'R' : ''}${offers.price}`;
  if (offers.lowPrice != null) return `From ${offers.priceCurrency === 'ZAR' ? 'R' : ''}${offers.lowPrice}`;
  return 'See listing';
}

function normalise(event, source, categoryHint) {
  const start = new Date(event.startDate);
  if (Number.isNaN(start.getTime())) return null;
  const end = event.endDate ? new Date(event.endDate) : null;
  const venue = locationText(event);
  if (!AREA.test(venue) || OUTSIDE.test(venue)) return null;
  const title = String(event.name).trim();
  if (!title) return null;
  return {
    id: `ext-${source}-${Buffer.from((event.url || title) + start.toISOString()).toString('base64url').slice(0, 18)}`,
    title,
    start: start.toISOString(),
    dateLabel: start.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Johannesburg' }),
    venue,
    area: (venue.match(AREA) || ['Durban'])[0].replace(/^kzn$/i, 'Durban'),
    price: priceText(event),
    url: event.url || '',
    image: typeof event.image === 'string' ? event.image : event.image?.url || '',
    category: classify(title, event.description || '', categoryHint || 'social'),
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
  const feeds = [
    ['events/', 'social'],
    ['art/', 'creative'],
    ['food-and-drink/', 'food'],
    ['networking/', 'social'],
    ['music/', 'music'],
    ['outdoors/', 'outdoors'],
    ['wellness/', 'wellness'],
  ];
  const results = await Promise.all(feeds.map(([suffix, category]) =>
    fetchJsonLd('Eventbrite', `https://www.eventbrite.com/d/south-africa--durban/${suffix}`, category, true, 7000)
  ));
  const events = results.flatMap(r => r.events || []);
  const ok = results.some(r => r.ok);
  return { name: 'Eventbrite', ok, status: ok ? 200 : 0, events };
}

async function fetchQuicket() {
  return fetchJsonLd('Quicket', 'https://www.quicket.co.za/events/', 'social', true, 8000);
}

async function fetchWebtickets() {
  const searches = ['Durban', 'Umhlanga'];
  const results = await Promise.all(searches.map(async searchTerm => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const url = `https://www.webtickets.co.za/v2/search.aspx?search=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, signal: controller.signal });
      if (!res.ok) return [];
      const html = await res.text();
      const cards = html.split('product-card-thumb').slice(1);
      const events = [];
      for (const card of cards) {
        const link = card.match(/href="(event\.aspx\?itemid=\d+)"[^>]*>[\s\S]*?<h3[^>]*product-card-title[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
        const meta = card.match(/product-card-meta[^>]*>\s*([^<]+)</i);
        const venue = card.match(/product-card-category[\s\S]*?<li>([^<]+)<\/li>/i);
        if (!link || !meta) continue;
        const start = new Date(meta[1].trim());
        if (Number.isNaN(start.getTime())) continue;
        const title = link[2].replace(/\s+/g, ' ').trim();
        const place = (venue ? venue[1] : '').trim() || 'Durban';
        if (!AREA.test(place)) continue;
        events.push({
          id: `ext-webtickets-${link[1].match(/\d+/)[0]}`,
          title,
          start: start.toISOString(),
          dateLabel: start.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Johannesburg' }),
          venue: place,
          area: (place.match(AREA) || ['Durban'])[0],
          price: 'See listing',
          url: `https://www.webtickets.co.za/v2/${link[1]}`,
          image: '',
          category: classify(title),
          source: 'Webtickets',
          external: true,
        });
      }
      return events;
    } catch { return []; } finally { clearTimeout(timer); }
  }));
  return { name: 'Webtickets', ok: true, status: 200, events: results.flat() };
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
      category: classify(e.name),
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
        category: classify(e.name + ' ' + (e.description || '')),
        source: 'Facebook',
        external: true,
      }));
    }));
    return { name: 'Facebook', ok: true, status: 200, events: results.flat() };
  } catch { return { name: 'Facebook', ok: false, events: [] }; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }

  if (cache.payload && Date.now() - cache.at < CACHE_TTL_MS) {
    return res.status(200).json({ ...cache.payload, cached: true });
  }

  const sources = await Promise.all([
    fetchEventbrite(),
    fetchQuicket(),
    fetchWebtickets(),
    fetchTicketmaster(),
    fetchFacebook(),
  ]);

  const since = Date.now() - 6 * 60 * 60 * 1000;
  const seen = new Set();
  const events = [];
  for (const source of sources) {
    for (const event of source.events || []) {
      const start = new Date(event.start).getTime();
      if (!start || start < since) continue;
      const key = `${event.title.toLowerCase()}|${event.start.slice(0, 10)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      events.push(event);
    }
  }
  events.sort((a, b) => new Date(a.start) - new Date(b.start));

  const payload = {
    updatedAt: new Date().toISOString(),
    events: events.slice(0, 80),
    sources: sources.map(s => ({ name: s.name, ok: Boolean(s.ok), count: (s.events || []).length, skipped: Boolean(s.skipped), error: s.error || null })),
  };
  cache = { at: Date.now(), payload };
  return res.status(200).json(payload);
}
