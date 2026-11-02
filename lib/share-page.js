/**
 * Server-rendered share page for Facebook/WhatsApp previews.
 * Crawlers cannot execute the React app, so this returns OG tags and a
 * human-readable card, then redirects real browsers to the React listing.
 */
function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function sharePage(req, res, id) {
  const base = (process.env.APP_URL || 'https://ssoul.co.za').replace(/\/$/, '');
  let event = null;
  try {
    const data = await fetch(base + '/api/events').then(r => r.json());
    event = (data.events || []).find(e => e.id === id || e.slug === id) || null;
  } catch { /* fall through */ }

  const title = event ? `${event.title} — Solo Soul Experiences` : 'Durban experiences — Solo Soul Experiences';
  const description = event
    ? `${event.dateLabel} · ${event.venue} · ${event.price}. View the listing on Solo Soul Experiences.`
    : 'Curated solo experiences and live Durban event listings.';
  const fallback = {
    creative: '/assets/images/experience_sip_paint_1783927393574.webp',
    food: '/assets/images/experience_brunch_1783927375716.webp',
    outdoors: '/assets/images/experience_sunset_walk_1783927384287.webp',
    wellness: '/assets/images/experience_coffee_journal_1783927404043.webp',
    luxury: '/assets/images/experience_luxury_spa_1783927426028.webp',
    fitness: '/assets/images/experience_nature_hike_1783927415406.webp',
  }[event?.category] || '/assets/images/hero_ocean_sunrise.webp';
  const image = event && event.image ? event.image : base + fallback;
  const eventKey = event ? (event.slug || event.id) : id;
  const target = event ? `${base}/events/${encodeURIComponent(eventKey)}` : `${base}/events`;

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:url" content="${base}/e/${encodeURIComponent(eventKey)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<style>
body{margin:0;background:#F8EFE4;color:#2A2430;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px}
.card{max-width:540px;background:#fff;border:1px solid rgba(46,94,78,.15);border-radius:18px;padding:28px;text-align:center}
.card img{width:100%;height:220px;object-fit:cover;border-radius:12px;margin-bottom:18px}
h1{font-family:Georgia,serif;font-weight:400;color:#0B3C49;font-size:30px;line-height:1.2}
p{color:#5f6b64;line-height:1.6}
a{display:inline-block;margin-top:14px;background:#E76F51;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600}
</style>
</head><body><div class="card">
${event ? `<img src="${escapeHtml(image)}" alt="">` : ''}
<h1>${escapeHtml(event ? event.title : 'Durban experiences')}</h1>
<p>${escapeHtml(description)}</p>
<a href="${escapeHtml(target)}">${event ? 'View listing' : 'Browse events'}</a>
</div>
<script>setTimeout(function(){location.replace(${JSON.stringify(target)})},1200)</script>
</body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).send(html);
}
