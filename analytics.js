/* First-party SSoul analytics.
 * No cookies, no advertising pixels, no IP storage. A random visitor id in
 * localStorage distinguishes returning browsers; clear site data to reset it.
 */
(function () {
  'use strict';

  if (window.__ssoulAnalyticsLoaded) return;
  window.__ssoulAnalyticsLoaded = true;

  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';
  var bot = navigator.webdriver || /bot|crawler|spider|headless|lighthouse|facebookexternalhit/i.test(navigator.userAgent || '');
  if (local || dnt || bot) {
    window.ssoulTrack = function () {};
    return;
  }

  var TYPES = ['pageview', 'event_view', 'outbound_click', 'registration', 'booking_start', 'booking_completed'];
  var params = new URLSearchParams(location.search);
  var referrerHost = '';
  try {
    referrerHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
  } catch (e) { referrerHost = ''; }

  var utmSource = (params.get('utm_source') || '').trim().toLowerCase();
  var fbclid = params.get('fbclid');
  var source = utmSource
    || (fbclid ? 'facebook' : '')
    || (referrerHost.indexOf('facebook') !== -1 ? 'facebook' : '')
    || (referrerHost.indexOf('instagram') !== -1 ? 'instagram' : '')
    || (referrerHost.indexOf('google') !== -1 ? 'google' : '')
    || referrerHost
    || 'direct';
  var medium = (params.get('utm_medium') || '').trim().toLowerCase()
    || (utmSource || fbclid ? 'social' : referrerHost ? 'referral' : 'none');
  var campaign = (params.get('utm_campaign') || '').trim().toLowerCase() || null;

  function visitorId() {
    try {
      var key = 'ssoul_visitor_id';
      var current = localStorage.getItem(key);
      if (current && /^[a-zA-Z0-9_-]{8,64}$/.test(current)) return current;
      var next = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
      localStorage.setItem(key, next);
      return next;
    } catch (e) {
      return 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
    }
  }

  var vid = visitorId();
  var device = window.innerWidth <= 640 ? 'mobile' : window.innerWidth <= 1024 ? 'tablet' : 'desktop';

  function pathname() {
    var path = location.pathname.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
    return path || '/';
  }

  function send(eventType, data) {
    if (TYPES.indexOf(eventType) === -1) return;
    var payload = {
      action: 'track',
      eventType: eventType,
      visitorId: vid,
      path: pathname(),
      source: source,
      medium: medium,
      campaign: campaign,
      referrer: referrerHost || null,
      device: device,
      eventId: data && data.eventId ? String(data.eventId).slice(0, 120) : null,
      eventName: data && data.eventName ? String(data.eventName).slice(0, 200) : null,
      metadata: data && data.metadata ? data.metadata : null,
    };
    try {
      fetch('/api/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
        credentials: 'same-origin',
      }).catch(function () {});
    } catch (e) { /* analytics must never break the page */ }
  }

  window.ssoulTrack = function (eventType, data) {
    send(eventType, data || {});
  };

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[data-track-outbound]') : null;
    if (!link || !link.href) return;
    send('outbound_click', {
      eventId: link.getAttribute('data-event-id') || '',
      eventName: link.getAttribute('data-event-name') || '',
      metadata: {
        url: link.href.slice(0, 500),
        provider: link.getAttribute('data-provider') || '',
      },
    });
  }, true);

  send('pageview', { metadata: { title: String(document.title || '').slice(0, 200) } });
})();
