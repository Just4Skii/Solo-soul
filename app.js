/* =============================================================
   SOLO SOUL EXPERIENCES — app.js
   Complete interactive JavaScript
   ============================================================= */

// ---- BLOG CONTENT DATA ------------------------------------
const blogContent = {
  blog1: {
    title: "Why Dating Yourself Might Be the Best Relationship You'll Ever Have",
    category: "Self Love",
    catClass: "",
    readTime: "5 min read",
    date: "July 2026",
    image: "assets/images/experience_coffee_journal_1783927404043.webp",
    content: `
      <p>There's a radical, quietly revolutionary act that millions of people are discovering: taking themselves on a date. Not as a last resort, not because no one was available — but as a deliberate, joyful declaration of self-worth. Dating yourself is the practice of spending intentional, pleasurable time in your own company, just as you would with someone you deeply love.</p>
      <blockquote>"The most important relationship you will ever have is the one you have with yourself. Everything else flows from that."</blockquote>
      <p>It begins with something small. A solo visit to that restaurant you've been eyeing for months. A Saturday morning at a café with your journal and a perfect coffee. A walk through the botanical gardens with no destination and no deadline. These moments — seemingly ordinary — begin to accumulate into something extraordinary: a deep, rooted sense of your own company being not just enough, but delightful.</p>
      <p>When you date yourself, you stop outsourcing your happiness to other people. You discover your own preferences without compromise. You order exactly what you want. You stay as long as you like. You leave when you're ready. This kind of freedom is profoundly healing, especially for those who have spent years shrinking themselves to fit into relationships, friendships, or social expectations.</p>
      <p>The beautiful irony is that those who learn to love their own company almost always become magnetic. They stop being desperate for connection because they are already full. They choose relationships from abundance rather than longing — and that changes everything. So take yourself out. You deserve a devoted, attentive, loving companion. And you already are one.</p>
    `
  },
  blog2: {
    title: "5 Ways Solo Travel Builds Unshakeable Confidence",
    category: "Adventure",
    catClass: "adventure",
    readTime: "4 min read",
    date: "June 2026",
    image: "assets/images/experience_nature_hike_1783927415406.webp",
    content: `
      <p>There is no faster path to self-confidence than navigating the world alone. Solo travel — whether it's a day hike in a new nature reserve or a weekend trip to a coastal town — forces you into a beautiful kind of growth that no classroom, self-help book, or advice from a friend can replicate. It is learning by becoming.</p>
      <blockquote>"Every solo adventure is a small act of self-trust. And self-trust, once built, cannot easily be taken away."</blockquote>
      <p><strong>1. You make decisions without a net.</strong> When you're alone, every decision is yours. Where to go, what to eat, when to rest. At first, this can feel overwhelming. But gradually, you learn to trust your instincts — and that muscle, once developed, serves you in every area of life.</p>
      <p><strong>2. You solve problems in real time.</strong> Missed a turning? Found the café closed? These small challenges, faced alone and resolved alone, become proof of your own capability. You discover: "I handled that." And that evidence is priceless.</p>
      <p><strong>3. You become comfortable with your own silence.</strong> Without someone to fill every moment with conversation, you learn to sit with yourself — and discover that your own company is peaceful, creative, and interesting. The internal noise quiets and something deeper emerges.</p>
      <p><strong>4. You attract beautiful encounters.</strong> Solo travellers are often approached by curious, open-hearted strangers. Without a companion to retreat into, you are more open, more present, more available for genuine human connection.</p>
      <p><strong>5. You return knowing yourself better.</strong> Solo travel is ultimately a journey inward disguised as a journey outward. You return not just with memories, but with knowledge of who you are when no one is watching — and that is the most valuable souvenir of all.</p>
    `
  },
  blog3: {
    title: "Learning to Enjoy Your Own Company",
    category: "Mindfulness",
    catClass: "mindful",
    readTime: "3 min read",
    date: "June 2026",
    image: "assets/images/gallery_cafe_1783927503191.webp",
    content: `
      <p>Most of us were never taught how to be alone. From childhood, we were arranged into classrooms, families, friendship groups, and social structures. Aloneness was associated with punishment (sit in the corner), rejection (no one picked you), or failure (staying home on a Friday night). No wonder it feels so uncomfortable at first.</p>
      <blockquote>"Solitude is not absence — it is presence. Your own full, undivided presence with yourself."</blockquote>
      <p>But here's what the most grounded, joyful people understand: enjoying your own company is a skill. And like all skills, it improves with practice, patience, and the right environment. You don't have to love being alone immediately. You just have to start.</p>
      <p>Begin with small, structured doses. A solo coffee at a café you love. A walk without your phone in your hand. An evening meal cooked just for yourself, served on your best plates, with candles. These are not sad scenes — they are acts of deep self-regard. You are telling yourself: "You are worth this effort. You are worth this care."</p>
      <p>Over time, the discomfort fades. The mental commentary quiets. And what emerges in the silence is something remarkable: your actual self. Your preferences. Your humour. Your observations. Your creativity. These things were always there — they simply couldn't be heard over the noise of social performance. Being alone is not lonely. It is, for many, the first time they've ever truly met themselves. And that meeting changes everything.</p>
    `
  },
  blog4: {
    title: "Healing Through Nature: A Solo Soul's Guide",
    category: "Healing",
    catClass: "healing",
    readTime: "6 min read",
    date: "May 2026",
    image: "assets/images/experience_nature_hike_1783927415406.webp",
    content: `
      <p>There is a reason human beings have always retreated to nature in times of grief, confusion, and longing. Long before therapy, meditation apps, and self-help culture, there were forests, oceans, mountains, and rivers. And they worked. They still do. The science now confirms what our ancestors understood intuitively: nature heals.</p>
      <blockquote>"The earth does not ask you to be okay. It simply holds you while you find your way back to yourself."</blockquote>
      <p>Studies consistently show that spending time in natural environments reduces cortisol (the stress hormone), lowers blood pressure, improves mood, and restores mental clarity. The Japanese have a practice called <em>Shinrin-yoku</em> — forest bathing — that prescribes slow, mindful walks through trees as medicine for anxiety and burnout. It is not metaphorical. The trees literally exhale compounds called phytoncides that calm the human nervous system.</p>
      <p>But beyond biology, there is something spiritual about being alone in nature. Without the mirror of other people reflecting our roles and identities back at us — colleague, partner, parent, friend — we are returned to something more essential. We become simply: a person. Standing under a vast sky. Breathing. Alive. The smallness of our worries becomes apparent against the backdrop of mountains or ocean. Not dismissively — but mercifully. Nature contextualises our pain without minimising it.</p>
      <p>A solo nature experience doesn't need to be dramatic. A walk through Durban's Botanical Gardens. A sunrise at the beachfront. A quiet afternoon on a hiking trail in the Valley of a Thousand Hills. These ordinary encounters with the natural world, taken slowly and intentionally, are medicine. So the next time life feels too heavy, step outside. Walk slowly. Let the earth hold you. You don't have to have it figured out. You just have to keep going.</p>
    `
  }
};

// ---- EVENTS DATA ------------------------------------------
const soloEvents = [];
let externalEvents = [];

const cityEvents = [
  { title: 'Durban Botanic Gardens',        date: 'Open daily',      venue: 'Berea, Durban',            link: 'https://www.durbanbotanicgardens.org.za', icon: '🌿', source: 'Official site' },
  { title: 'Golden Mile Beachfront',        date: 'Open daily',      venue: 'Durban Beachfront',        link: 'https://www.durban.gov.za', icon: '🌊', source: 'eThekwini Municipality' },
  { title: 'Wilson\'s Wharf',              date: 'Open daily',      venue: 'Point, Durban',            link: 'https://www.wilsonswharf.co.za', icon: '⛵', source: 'Official site' },
  { title: 'uShaka Marine World',           date: 'Open daily',      venue: 'Point, Durban',            link: 'https://www.ushakamarineworld.co.za', icon: '🐠', source: 'Official site' },
  { title: 'Krantzkloof Nature Reserve',    date: 'Open daily',      venue: 'Kloof, KwaZulu-Natal',     link: 'https://www.kznwildlife.com', icon: '🥾', source: 'KZN Wildlife' },
  { title: 'Durban ICC events',             date: 'See calendar',    venue: 'Durban ICC',               link: 'https://www.icc.co.za', icon: '🎭', source: 'Official site' },
];

// ---- DATABASE EVENT LOADER ---------------------------------
// Replace static soloEvents with DB-backed data when available
let dbEventsLoaded = false;

async function loadEventsFromDB() {
  try {
    if (typeof SupabaseService !== 'undefined' && SupabaseService.fetchEvents) {
      const dbEvents = await SupabaseService.fetchEvents();
      const isDatabasePayload = Array.isArray(dbEvents) && dbEvents.length > 0 && dbEvents.every(e => e && e.event_name);
      if (isDatabasePayload) {
        // Map DB events to soloEvents format
        const mapped = dbEvents.map(e => ({
          date: new Date(e.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
          exp: e.event_name,
          location: e.location,
          duration: e.duration || 'TBD',
          price: e.is_free ? 'FREE' : (e.price || 'FREE'),
          spots: e.spots_total || 10,
          category: e.category || 'mindful',
          spotsLeft: e.spots_left || e.spots_total || 10,
          isFree: e.is_free || false,
          id: e.id,
          image_url: e.image_url || null,
          description: e.description || null,
          is_featured: e.is_featured || false,
        }));
        // Merge with existing hardcoded events (DB events override same-date+name ones)
        const existingKeys = new Set(soloEvents.map(e => e.date + '::' + e.exp));
        const merged = [...mapped, ...soloEvents.filter(e => !existingKeys.has(e.date + '::' + e.exp))];
        soloEvents.length = 0;
        soloEvents.push(...merged);
        dbEventsLoaded = true;
        console.log('✅ Events loaded from database');
        return;
      }
    }
    console.log('ℹ️ Using hardcoded events (DB unavailable)');
  } catch (err) {
    console.warn('⚠️ DB events failed, using hardcoded:', err.message);
  }
}

// ---- TICKET VERIFICATION CACHE -----------------------------
// Cache verified status from Gemini-backed API
let ticketVerifications = {};
let verificationCacheTime = 0;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

async function loadTicketVerifications() {
  try {
    // Try localStorage cache first
    const cached = localStorage.getItem('ticketVerifications');
    const cacheTime = parseInt(localStorage.getItem('ticketVerificationTime') || '0');
    if (cached && cacheTime && (Date.now() - cacheTime < CACHE_TTL)) {
      ticketVerifications = JSON.parse(cached);
      console.log('✅ Using cached ticket verifications');
      return;
    }

    // Fetch fresh verification data from API
    const resp = await fetch('/api/tickets/verify');
    const data = await resp.json();
    if (data.results) {
      data.results.forEach(r => {
        ticketVerifications[r.title] = r;
      });
      // Cache
      localStorage.setItem('ticketVerifications', JSON.stringify(ticketVerifications));
      localStorage.setItem('ticketVerificationTime', Date.now().toString());
      verificationCacheTime = Date.now();
      console.log('✅ Ticket verifications loaded from API');
    }
  } catch (err) {
    console.warn('⚠️ Ticket verification fetch failed:', err.message);
    // Use cached data if API fails
    if (localStorage.getItem('ticketVerifications')) {
      ticketVerifications = JSON.parse(localStorage.getItem('ticketVerifications'));
    }
  }
}

// Get verification status for a city event
function getTicketStatus(title) {
  const v = ticketVerifications[title];
  if (!v) return { badge: '', text: 'Check tickets', link: null };
  if (v.status === 'dead') {
    return {
      badge: '<span class="verify-badge dead" title="' + escapeHtml(v.notes || 'Link may be dead') + '">⚠️ Verify</span>',
      text: 'Find Tickets',
      link: v.effectiveUrl || null,
    };
  }
  if (v.status === 'redirected') {
    return {
      badge: '<span class="verify-badge redirected" title="Link has moved">🔀 Updated</span>',
      text: 'Get Tickets',
      link: v.effectiveUrl || v.originalUrl,
    };
  }
  return {
    badge: '<span class="verify-badge verified" title="Link verified">✅ Verified</span>',
    text: 'Get Tickets',
    link: v.effectiveUrl || v.originalUrl,
  };
}

// ---- DOM READY --------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Paint the interface first: never let a slow/dead API hold the page hostage.
  // Inner pages have no hero, so keep the navigation legible immediately.
  if (!document.querySelector('.hero')) document.getElementById('navbar')?.classList.add('scrolled');

  // Mark the current page in the navigation. Works for clean URLs (/experiences)
  // as well as direct .html previews.
  const pageName = (window.location.pathname.replace(/\/+$/, '').split('/').pop() || 'index').replace(/\.html$/, '');
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.includes('#')) return;
    const target = href.split('#')[0].replace(/\/+$/, '').split('/').pop().replace(/\.html$/, '') || 'index';
    if (target === pageName) link.classList.add('active');
  });

  initPreloader();
  initAOS();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initTestimonials();
  initFAQ();
  initScrollToTop();
  initParallax();
  initStatCounters();
  updateNavbarLinks();
  initUserSettings();

  // Payment return notice
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    const ref = params.get('ref');
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:99999;background:#0B3C49;color:#fff;padding:14px 22px;border-radius:12px;font-size:14px;box-shadow:0 12px 34px rgba(0,0,0,.25);max-width:90vw;text-align:center;';
    banner.innerHTML = 'Payment received' + (ref ? ' — ref <strong>' + escapeHtml(ref) + '</strong>' : '') + '. Your booking will show as paid once Paystack confirms it.';
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 9000);
    history.replaceState({}, '', window.location.pathname);
  }

  // Character limits on textareas
  const bookingNotes = document.getElementById('booking-notes');
  if (bookingNotes) {
    bookingNotes.addEventListener('input', function() {
      if (this.value.length > 500) {
        this.value = this.value.substring(0, 500);
      }
    });
  }
  const contactMsg = document.getElementById('contact-message');
  if (contactMsg) {
    contactMsg.addEventListener('input', function() {
      if (this.value.length > 1000) {
        this.value = this.value.substring(0, 1000);
      }
    });
  }

  // Apply event deep links before the feed paints so a shared
  // /events?category=... URL opens on the right filter, not a flash of all events.
  applyEventQueryParams();

  // Hydrate real events in the background; never block the page on the API.
  const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const sync = loadEventsFromDB();
  const live = loadExternalEvents();
  const refresh = () => {
    populateBookingExperiences();
    updateHeroStats();
    initEventsTable();
  };
  sync.then(refresh).catch(() => {});
  live.then(refresh).catch(() => {});
  Promise.race([Promise.all([sync, live]), timeout(6000)]).finally(() => {
    refresh();
    initEventFilters();
    initCityEvents();
    loadTicketVerifications().catch(() => {});
  });
});

// ---- PRELOADER --------------------------------------------
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      setTimeout(() => { preloader.style.display = 'none'; }, 500);
    }, 400);
  });

  // Fallback
  setTimeout(() => {
    if (preloader && !preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      setTimeout(() => { preloader.style.display = 'none'; }, 500);
    }
  }, 1200);
}

// ---- AOS --------------------------------------------------
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: true, offset: 80, easing: 'ease-out-cubic' });
  }
}

// ---- NAVBAR -----------------------------------------------
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ---- MOBILE MENU ------------------------------------------
function initMobileMenu() {
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const overlay     = document.getElementById('mobile-overlay');
  const closeBtn    = document.getElementById('mobile-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function openMenu() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  document.querySelector('.mobile-nav-btn')?.addEventListener('click', closeMenu);
}

// ---- SMOOTH SCROLL ----------------------------------------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '#booking') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      // Mobile-friendly offset: larger on mobile for better header clearance
      const offset = window.innerWidth <= 768 ? 60 : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ---- STAT COUNTERS ----------------------------------------
function initStatCounters() {
  const statNums = document.querySelectorAll('.stat-num');
  if (!statNums.length) return;

  let counted = false;
  const heroSection = document.getElementById('home');

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function runCounters() {
    if (counted) return;
    counted = true;
    statNums.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      if (!Number.isFinite(target)) return;
      const duration = 2200;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        el.textContent = Math.floor(easeOut(progress) * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }
      requestAnimationFrame(update);
    });
  }

  // Run immediately if already visible (page load at top)
  runCounters();

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) runCounters();
  }, { threshold: 0.1 });

  if (heroSection) observer.observe(heroSection);
}

// ---- REAL DATA RENDERING -----------------------------------
function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function loadExternalEvents() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    const res = await fetch('/api/events', { signal: controller.signal, headers: { Accept: 'application/json' } });
    clearTimeout(timer);
    if (!res.ok) return;
    const data = await res.json();
    externalEvents = (data.events || []).map(e => ({
      date: e.dateLabel,
      start: e.start,
      area: e.area || 'Durban',
      exp: e.title,
      location: e.venue,
      duration: '',
      price: e.price,
      spots: 0,
      spotsLeft: 0,
      isFree: /free/i.test(e.price || ''),
      category: e.category || 'social',
      external: true,
      id: e.id,
      slug: e.slug,
      url: e.url,
      image: e.image,
      description: e.description || '',
      source: e.source,
    }));
  } catch {
    externalEvents = [];
  }
}

function populateBookingExperiences() {
  const select = document.getElementById('booking-experience');
  if (!select) return;
  const names = [...new Set(soloEvents.map(e => e.exp).filter(Boolean))];
  select.innerHTML = '<option value="">' + (names.length ? 'Choose an experience...' : 'No experiences scheduled yet') + '</option>' +
    names.map(name => {
      const evt = soloEvents.find(e => e.exp === name);
      return '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + ' — ' + (evt.isFree ? 'FREE' : escapeHtml(evt.price)) + '</option>';
    }).join('');
  select.disabled = names.length === 0;
}

function updateHeroStats() {
  const wrap = document.querySelector('.hero-stats');
  if (!wrap) return;
  const all = [...soloEvents, ...externalEvents];
  if (!all.length) { wrap.hidden = true; return; }
  wrap.hidden = false;
  const values = [
    all.length,
    new Set(all.map(e => e.location).filter(Boolean)).size,
    new Set(all.map(e => e.external ? e.source : 'Solo Soul')).size,
  ];
  wrap.querySelectorAll('.stat-num').forEach((el, i) => {
    if (values[i] === undefined) return;
    el.dataset.target = values[i];
    el.textContent = values[i];
  });
}

// ---- EVENTS TABLE -----------------------------------------
function initEventsTable() {
  const list = document.getElementById('events-list');
  if (list) { renderEventCards(list); return; }
  const tbody = document.getElementById('events-tbody');
  if (!tbody) return;

  // Clear existing items in table first
  tbody.innerHTML = '';

  // Get current user preferences
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const prefs = (currentUser && currentUser.preferences) ? currentUser.preferences : [];

  const allEvents = [...soloEvents, ...externalEvents];
  allEvents.forEach(evt => {
    if (evt.external) {
      const tr = document.createElement('tr');
      tr.dataset.category = evt.category || 'social';
      tr.dataset.source = evt.source || '';
      tr.dataset.area = evt.area || 'Durban';
      tr.dataset.free = evt.isFree ? '1' : '0';
      tr.dataset.date = evt.start || '';
      tr.dataset.search = (evt.exp + ' ' + evt.location).toLowerCase();
      tr.dataset.spotsLeft = 0;
      tr.innerHTML = '<td><strong>' + escapeHtml(evt.date) + '</strong></td>' +
        '<td><span class="event-name">' + escapeHtml(evt.exp) + '</span></td>' +
        '<td><i class="fas fa-map-marker-alt" style="color:var(--sage);margin-right:6px;font-size:12px;"></i>' + escapeHtml(evt.location) + '</td>' +
        '<td>—</td><td><span class="event-price">' + escapeHtml(evt.price) + '</span></td>' +
        '<td><span class="spots-pill spots-ok">Live listing</span></td>' +
        '<td><a class="book-event-btn" href="/portal/?event=' + encodeURIComponent(evt.id) + '">Details</a> ' + (evt.url ? '<a href="' + escapeHtml(evt.url) + '" data-track-outbound data-event-id="' + escapeHtml(evt.id || '') + '" data-event-name="' + escapeHtml(evt.exp || '') + '" data-provider="' + escapeHtml(evt.source || '') + '" target="_blank" rel="noopener noreferrer" style="font-size:11px;margin-left:8px;">Tickets ↗</a>' : '') + '</td>';
      tbody.appendChild(tr);
      return;
    }
    const spotsClass = evt.spotsLeft <= 3 ? 'spots-low' : evt.spotsLeft <= 6 ? 'spots-mid' : 'spots-ok';
    const spotsText  = evt.isFree
      ? `<span class="spots-pill spots-ok">${evt.spotsLeft} free spots</span>`
      : (evt.spotsLeft <= 3
        ? `<span class="spots-pill spots-low">⚡ ${evt.spotsLeft} left!</span>`
        : `<span class="spots-pill ${spotsClass}">${evt.spotsLeft} spots</span>`);
    const priceDisplay = evt.isFree
      ? '<span style="color:#27ae60;font-weight:700;font-size:15px;">FREE</span>'
      : `<span class="event-price">${escapeHtml(evt.price)}</span>`;
    const btnLabel = evt.spotsLeft <= 0 ? 'Sold Out' : (evt.isFree ? 'Reserve Spot' : 'Book Now');
    const btnDisabled = evt.spotsLeft <= 0 ? 'disabled style="opacity:0.4;cursor:not-allowed"' : '';

    // Interest Match Badge
    let matchBadge = '';
    if (prefs.includes(evt.category)) {
      matchBadge = `<span class="pref-match-badge" title="Interest Match"><i class="fas fa-star"></i> Match</span>`;
    }

    const tr = document.createElement('tr');
    tr.dataset.category = evt.category;
    tr.dataset.source = 'Solo Soul';
    tr.dataset.area = (evt.location || '').match(/durban|umhlanga|kloof|westville|hillcrest|pinetown|berea|ballito/i)?.[0] || 'Durban';
    tr.dataset.free = evt.isFree ? '1' : '0';
    tr.dataset.date = (() => { const d = new Date(evt.date); return Number.isNaN(d.getTime()) ? '' : d.toISOString(); })();
    tr.dataset.search = (evt.exp + ' ' + evt.location).toLowerCase();
    tr.dataset.spotsLeft = evt.spotsLeft;
    tr.dataset.expName   = evt.exp;
    tr.dataset.isFree    = evt.isFree ? '1' : '0';
    tr.innerHTML = `
      <td><strong>${escapeHtml(evt.date)}</strong></td>
      <td>
        <span class="event-name">${escapeHtml(evt.exp)}</span>
        <span class="event-cat-badge">${escapeHtml(evt.category)}</span>
        ${matchBadge}
      </td>
      <td><i class="fas fa-map-marker-alt" style="color:var(--sage);margin-right:6px;font-size:12px;"></i>${escapeHtml(evt.location)}</td>
      <td>${escapeHtml(evt.duration)}</td>
      <td>${priceDisplay}</td>
      <td>${spotsText}</td>
      <td><button class="book-event-btn" ${btnDisabled} onclick="openBookingModal('${escapeHtml(evt.exp).replace(/'/g, "\\'")}', ${Number(evt.spotsLeft) || 0}, ${Boolean(evt.isFree)})">${btnLabel}</button></td>
    `;
    tbody.appendChild(tr);
  });

  if (!allEvents.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px 20px;color:#5f6b64;">' +
      '<strong style="display:block;font-family:\'Playfair Display\',serif;font-size:22px;color:#2E5E4E;margin-bottom:8px;">New experiences are being finalised</strong>' +
      'Dates are published once confirmed. Join the newsletter or <a href="contact.html" style="color:#2E5E4E;text-decoration:underline;">get in touch</a> to hear first.' +
      '</td></tr>';
  }
  applyEventFilters();
}


function renderEventCards(list) {
  const all = [...soloEvents, ...externalEvents];
  if (!all.length) {
    list.innerHTML = '<div class="event-empty"><strong>New listings are on the way</strong><p>We are refreshing Durban’s calendars. Check back shortly.</p></div>';
    return;
  }
  list.innerHTML = all.map(evt => {
    const external = Boolean(evt.external);
    const date = external ? new Date(evt.start) : new Date(evt.date);
    const day = Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-ZA', { day: '2-digit' });
    const month = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-ZA', { month: 'short' });
    const title = external ? evt.exp : evt.exp;
    const category = (evt.category || 'social');
    const source = external ? evt.source : 'Solo Soul';
    const area = evt.area || (evt.location || '').match(/durban|umhlanga|kloof|westville|hillcrest|pinetown|berea|ballito/i)?.[0] || 'Durban';
    const details = external ? '/portal/?event=' + encodeURIComponent(evt.slug || evt.id) : '/portal/?experience=' + encodeURIComponent(evt.id);
    return '<article class="event-card" data-event data-category="' + escapeHtml(category) + '" data-source="' + escapeHtml(source) + '" data-area="' + escapeHtml(area) + '" data-free="' + (evt.isFree ? '1' : '0') + '" data-date="' + escapeHtml(external ? evt.start : (Number.isNaN(date.getTime()) ? '' : date.toISOString())) + '" data-search="' + escapeHtml((title + ' ' + (evt.location || '')).toLowerCase()) + '">' +
      '<div class="event-date"><strong>' + day + '</strong><span>' + month + '</span></div>' +
      '<div class="event-main"><div class="event-tags"><span class="event-cat">' + escapeHtml(category) + '</span><span class="event-src">' + escapeHtml(source) + '</span></div>' +
      '<h3><a href="' + details + '">' + escapeHtml(title) + '</a></h3>' +
      '<div class="event-where"><i class="fas fa-location-dot"></i> ' + escapeHtml(evt.location || '') + '</div></div>' +
      '<div class="event-side">' + (/^see listing$/i.test(String(evt.price || '').trim()) ? '' : '<div class="event-price">' + escapeHtml(evt.price || '') + '</div>') + '<div class="event-actions"><a class="event-details" href="' + details + '">' + (external ? 'View listing' : 'View details') + '</a></div></div>' +
      '</article>';
  }).join('');
  applyEventFilters();
}

// ---- EVENT FILTERS ----------------------------------------
const CATEGORY_ALIAS = { dining: 'food', nature: 'outdoors', mindful: 'wellness', city: 'social' };
const CATEGORY_LABELS = {
  all: 'event', wellness: 'wellness', creative: 'creative', food: 'food & drink',
  outdoors: 'outdoors', music: 'music', social: 'social', markets: 'markets',
  fitness: 'fitness', learning: 'learning', luxury: 'luxury'
};

function getActiveEventCategory() {
  return document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
}

function applyEventQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const requested = (params.get('category') || '').trim().toLowerCase();
  const category = CATEGORY_ALIAS[requested] || requested;
  const buttons = Array.from(document.querySelectorAll('.filter-btn'));
  const match = buttons.find(btn => btn.dataset.filter === category);
  if (match) {
    buttons.forEach(btn => btn.classList.remove('active'));
    match.classList.add('active');
    const chips = match.closest('.event-chips');
    if (chips) {
      chips.scrollLeft = match.offsetLeft - (chips.clientWidth / 2) + (match.clientWidth / 2);
    }
  }

  const term = params.get('q');
  const search = document.getElementById('event-search');
  if (term && search) search.value = term;

  const area = (params.get('area') || '').trim();
  const areaSelect = document.getElementById('event-area');
  if (area && areaSelect && Array.from(areaSelect.options).some(o => o.value === area)) {
    areaSelect.value = area;
  }
}

function syncEventQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const active = getActiveEventCategory();
  if (active && active !== 'all') params.set('category', active);
  else params.delete('category');
  const url = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
  window.history.replaceState({}, '', url);
}

function renderEventLoadMore(total) {
  const list = document.getElementById('events-list');
  if (!list) return;
  let more = document.getElementById('event-load-more');
  if (!more) {
    more = document.createElement('button');
    more.id = 'event-load-more';
    more.type = 'button';
    more.className = 'event-load-more';
    more.addEventListener('click', () => {
      eventVisibleLimit += 12;
      applyEventFilters();
    });
    list.insertAdjacentElement('afterend', more);
  }
  const remaining = Math.max(0, total - eventVisibleLimit);
  more.hidden = remaining === 0;
  more.textContent = remaining ? 'Show ' + Math.min(12, remaining) + ' more events' : '';
}

function resetEventDateFilter() {
  const dateSelect = document.getElementById('event-date');
  if (dateSelect) dateSelect.value = 'all';
  applyEventFilters();
}
window.resetEventDateFilter = resetEventDateFilter;

let eventVisibleLimit = 12;

function resetEventLimit() {
  eventVisibleLimit = 12;
}

function setEventLimit(value) {
  eventVisibleLimit = value;
}

function applyEventFilters() {
  const active = getActiveEventCategory();
  const source = document.getElementById('event-source')?.value || 'all';
  const area = (document.getElementById('event-area')?.value || 'all').toLowerCase();
  const price = document.getElementById('event-price')?.value || 'all';
  const when = document.getElementById('event-date')?.value || 'all';
  const term = (document.getElementById('event-search')?.value || '').trim().toLowerCase();
  const now = Date.now();
  const limit = when === 'week' ? now + 7 * 864e5 : when === 'month' ? now + 31 * 864e5 : when === 'quarter' ? now + 92 * 864e5 : 0;
  const counter = document.getElementById('event-count');

  const rows = document.querySelectorAll('#events-list [data-event], #events-tbody tr[data-search]');
  // No rows means the feed has not loaded (or every source is down). Keep the
  // page's own "listings are on the way" state instead of stacking a second empty state.
  if (!rows.length) {
    document.getElementById('event-no-match')?.remove();
    if (counter) counter.textContent = '';
    return;
  }

  let matched = 0;
  let visible = 0;
  rows.forEach(row => {
    const category = CATEGORY_ALIAS[row.dataset.category] || row.dataset.category;
    const okCategory = active === 'all' || category === active;
    const okSource = source === 'all' || row.dataset.source === source;
    const okArea = area === 'all' || (row.dataset.area || '').toLowerCase().includes(area);
    const okPrice = price === 'all' || (price === 'free' ? row.dataset.free === '1' : row.dataset.free !== '1');
    const ts = row.dataset.date ? new Date(row.dataset.date).getTime() : 0;
    const okDate = when === 'all' || (ts && ts >= now - 864e5 && ts <= limit);
    const okSearch = !term || (row.dataset.search || '').includes(term);
    const matches = okCategory && okSource && okArea && okPrice && okDate && okSearch;
    if (matches) matched++;
    const show = matches && matched <= eventVisibleLimit;
    row.classList.toggle('hidden', !show);
    if (show) visible++;
  });

  if (counter) counter.textContent = matched ? (matched > eventVisibleLimit ? visible + ' of ' + matched + ' events' : matched + (matched === 1 ? ' event' : ' events')) : '';
  renderEventLoadMore(matched);

  let empty = document.getElementById('event-no-match');
  if (!visible) {
    if (empty) empty.remove();
    const list = document.getElementById('events-list');
    empty = document.createElement(list ? 'div' : 'tr');
    empty.id = 'event-no-match';
    if (list) {
      const label = CATEGORY_LABELS[active] || active;
      const whenLabel = when === 'week' ? ' this week' : when === 'month' ? ' this month' : when === 'quarter' ? ' in the next three months' : '';
      const heading = active === 'all'
        ? 'No events match those filters'
        : 'No ' + label + ' listings' + whenLabel;
      const helper = active === 'all'
        ? 'Try another category, area or date range.'
        : 'Nothing in this theme right now. You can widen the date range or browse everything that is on.';
      empty.innerHTML = '<div class="event-empty"><strong>' + heading + '</strong><p>' + helper + '</p>' +
        '<div class="event-empty-actions">' +
        (when !== 'all' ? '<button type="button" onclick="resetEventDateFilter()">See all dates</button>' : '') +
        '<a href="/events">Browse all events</a></div></div>';
    } else {
      empty.innerHTML = '<td colspan="7" style="text-align:center;padding:30px;color:#5f6b64;">No events match those filters.</td>';
    }
    (list || document.getElementById('events-tbody'))?.appendChild(empty);
  } else if (empty) {
    empty.remove();
  }
}

function initEventFilters() {
  applyEventQueryParams();
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      resetEventLimit();
      syncEventQueryParams();
      applyEventFilters();
    });
  });
  ['event-source', 'event-area', 'event-price', 'event-date'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => { resetEventLimit(); applyEventFilters(); });
  });
  document.getElementById('event-search')?.addEventListener('input', () => { resetEventLimit(); applyEventFilters(); });
  resetEventLimit();
  applyEventFilters();
}

// ---- CITY EVENTS ------------------------------------------
function initCityEvents() {
  const grid = document.getElementById('city-events-grid');
  if (!grid) return;

  cityEvents.forEach(ev => {
    const v = getTicketStatus(ev.title);
    const card = document.createElement('div');
    card.className = 'city-event-card';
    card.innerHTML = `
      <div class="city-event-icon">${ev.icon}</div>
      <h5>${ev.title} ${v.badge}</h5>
      <div class="ced"><i class="fas fa-calendar" style="margin-right:6px;"></i>${ev.date}</div>
      <div class="cev"><i class="fas fa-map-marker-alt" style="margin-right:6px;"></i>${ev.venue}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
        <span style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.35);">${ev.source}</span>
        <a href="${v.link || ev.link}" target="_blank" rel="noopener noreferrer" class="city-event-link">
          ${v.text} <i class="fas fa-external-link-alt" style="font-size:10px;"></i>
        </a>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ---- TESTIMONIALS CAROUSEL --------------------------------
function initTestimonials() {
  const track  = document.getElementById('testimonials-track');
  const dotsEl = document.getElementById('testi-dots');
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;
  let autoTimer;

  function getVisible() {
    const w = window.innerWidth;
    return w < 640 ? 1 : w < 960 ? 2 : 3;
  }

  function totalSlides() {
    return Math.max(1, cards.length - getVisible() + 1);
  }

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const dot = document.createElement('div');
      dot.className = 'testi-dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    }
  }

  function setCardWidths() {
    const visible = getVisible();
    const gap = 28;
    const trackWidth = track.parentElement.offsetWidth;
    const cardWidth = (trackWidth - gap * (visible - 1)) / visible;
    cards.forEach(c => {
      c.style.width = cardWidth + 'px';
      c.style.flexShrink = '0';
    });
    track.style.gap = gap + 'px';
  }

  function goTo(idx) {
    const max = totalSlides() - 1;
    current = Math.max(0, Math.min(idx, max));
    const visible = getVisible();
    const gap = 28;
    const cardWidth = cards[0] ? cards[0].offsetWidth : 280;
    const offset = current * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
    dotsEl?.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1 >= totalSlides() ? 0 : current + 1); }
  function prev() { goTo(current - 1 < 0 ? totalSlides() - 1 : current - 1); }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 5000);
  }

  prevBtn?.addEventListener('click', () => { prev(); startAuto(); });
  nextBtn?.addEventListener('click', () => { next(); startAuto(); });

  // Touch/swipe
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    startAuto();
  });

  window.addEventListener('resize', () => {
    setCardWidths();
    buildDots();
    goTo(0);
  });

  setCardWidths();
  buildDots();
  goTo(0);
  startAuto();
}

// ---- FAQ ACCORDION ----------------------------------------
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.parentElement;
      const answer = btn.nextElementSibling;
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-answer').style.maxHeight = '0';
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ---- SCROLL TO TOP ----------------------------------------
function initScrollToTop() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
}

// ---- PARALLAX HERO ----------------------------------------
function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
      heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    }
  }, { passive: true });
}

// ---- GALLERY LIGHTBOX -------------------------------------
window.openLightbox = function(el) {
  const img     = el.querySelector('img');
  const lightbox = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lightbox-img');
  if (!img || !lightbox || !lbImg) return;
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
  document.getElementById('lightbox')?.classList.remove('active');
  document.body.style.overflow = '';
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeBookingModal();
    closeBlogModal();
  }
});

// ---- BOOKING FORM STATE DYNAMIC INITIALIZER (RING-FENCING DATES & GUESTS) -----------------
function updateBookingFormState(experienceName) {
  const dateSelect = document.getElementById('booking-date');
  const guestsSelect = document.getElementById('booking-guests');
  const payNote = document.getElementById('booking-pay-note');
  const title = document.getElementById('booking-modal-title');
  const subtitle = document.getElementById('booking-modal-subtitle');
  const submitBtn = document.getElementById('booking-submit-btn');

  if (!experienceName) {
    if (dateSelect) {
      dateSelect.innerHTML = '<option value="">Select an experience first...</option>';
      dateSelect.disabled = true;
    }
    return;
  }

  // Find scheduled instances of this experience in soloEvents
  const wanted = experienceName.trim().toLowerCase();
  const matchingEvents = soloEvents.filter(e => (e.exp || '').trim().toLowerCase() === wanted);
  
  if (matchingEvents.length === 0) {
    if (dateSelect) {
      dateSelect.innerHTML = '<option value="">No scheduled dates available</option>';
      dateSelect.disabled = true;
    }
    return;
  }

  // Populate available scheduled dates
  if (dateSelect) {
    dateSelect.innerHTML = '<option value="">Choose a date...</option>';
    matchingEvents.forEach(evt => {
      const opt = document.createElement('option');
      opt.value = evt.date;
      opt.textContent = `${evt.date} (${evt.isFree ? 'FREE' : evt.price})`;
      dateSelect.appendChild(opt);
    });
    dateSelect.disabled = false;
    // Auto-select the first option if there's only one date
    if (matchingEvents.length === 1) {
      dateSelect.selectedIndex = 1;
    }
  }

  // Define guests cap and pricing updates based on chosen date
  const updateGuestsAndPricing = () => {
    const selectedDate = dateSelect.value;
    const activeEvent = matchingEvents.find(e => e.date === selectedDate) || matchingEvents[0];
    if (!activeEvent) return;

    const free = activeEvent.isFree;
    const maxSpots = activeEvent.spotsLeft;

    // Update headings and buttons
    if (title) title.textContent = free ? 'Reserve Your Free Spot' : 'Book Your Experience';
    if (subtitle) subtitle.textContent = free 
      ? "Secure your place — it's completely free. We'll confirm via WhatsApp."
      : "Fill in your details and we'll confirm within 24 hours via WhatsApp.";
    if (payNote) payNote.style.display = free ? 'none' : 'flex';
    if (submitBtn) submitBtn.innerHTML = free 
      ? 'Reserve Free Spot <i class="fas fa-check"></i>' 
      : 'Pay & Book <i class="fas fa-credit-card"></i>';

    // Rebuild guests dropdown dynamically capped at available spots
    if (guestsSelect) {
      guestsSelect.innerHTML = '';
      if (maxSpots <= 0) {
        const opt = document.createElement('option');
        opt.value = "";
        opt.textContent = "Sold Out";
        guestsSelect.appendChild(opt);
        return;
      }
      const cap = Math.min(maxSpots, 10);
      for (let i = 1; i <= cap; i++) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = i === 1 ? '1 guest (just me)' : `${i} guests`;
        guestsSelect.appendChild(opt);
      }
      if (maxSpots <= 5) {
        const note = document.createElement('option');
        note.disabled = true;
        note.textContent = `── only ${maxSpots} left ──`;
        guestsSelect.appendChild(note);
      }
    }
  };

  if (dateSelect) {
    dateSelect.onchange = updateGuestsAndPricing;
    // Trigger immediately if auto-selected
    if (dateSelect.value) {
      updateGuestsAndPricing();
    }
  }
}

// Export to window
window.updateBookingFormState = updateBookingFormState;

// ---- BOOKING MODAL ----------------------------------------
window.openBookingModal = function(experienceName, spotsLeft, isFree) {
  const overlay      = document.getElementById('booking-modal-overlay');
  const selectEl     = document.getElementById('booking-experience');
  const dateSelect   = document.getElementById('booking-date');
  const submitBtn    = document.getElementById('booking-submit-btn');
  if (!overlay) return;
  if (!soloEvents.length) {
    alert('New experiences are being finalised. Please check back shortly or join the newsletter for the announcement.');
    return;
  }

  // Clean form state
  document.getElementById('booking-form')?.reset();
  document.getElementById('booking-success')?.classList.remove('show');
  if (submitBtn) { submitBtn.style.display = ''; submitBtn.disabled = false; }

  // Check if user is logged in to pre-fill info
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    const nameInput = document.getElementById('booking-name');
    const emailInput = document.getElementById('booking-email');
    const phoneInput = document.getElementById('booking-phone');
    if (nameInput) { nameInput.value = currentUser.name; nameInput.readOnly = true; }
    if (emailInput) { emailInput.value = currentUser.email; emailInput.readOnly = true; }
    if (phoneInput) { phoneInput.value = currentUser.phone; phoneInput.readOnly = true; }
  } else {
    // Reset readOnly if not logged in
    const nameInput = document.getElementById('booking-name');
    const emailInput = document.getElementById('booking-email');
    const phoneInput = document.getElementById('booking-phone');
    if (nameInput) { nameInput.value = ''; nameInput.readOnly = false; }
    if (emailInput) { emailInput.value = ''; emailInput.readOnly = false; }
    if (phoneInput) { phoneInput.value = ''; phoneInput.readOnly = false; }
  }

  // Pre-select experience if provided
  if (experienceName && selectEl) {
    const clean = experienceName.replace(/&amp;/g, '&').replace(/&#39;/g, "'");
    const opts  = Array.from(selectEl.options);
    let match = opts.find(o => o.value === clean);
    if (!match) match = opts.find(o => o.value && clean.toLowerCase().startsWith(o.value.toLowerCase().slice(0, 10)));
    if (!match) {
      const word = clean.toLowerCase().split(' ')[0];
      match = opts.find(o => o.value && o.value.toLowerCase().includes(word));
    }
    if (match) {
      selectEl.value = match.value;
    }
  }

  // Initialize booking form dates and guest selection based on selection
  updateBookingFormState(selectEl.value);

  // If opening a specific scheduled date, lock the option
  if (experienceName && dateSelect) {
    const matchedEvent = soloEvents.find(e => e.exp === experienceName);
    if (matchedEvent) {
      dateSelect.value = matchedEvent.date;
      // Trigger update manually
      dateSelect.onchange();
    }
  }

  // Bind change listener on experience selection
  selectEl.onchange = (e) => {
    updateBookingFormState(e.target.value);
  };

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

function closeBookingModal(event) {
  if (event && event.target !== document.getElementById('booking-modal-overlay')) return;
  document.getElementById('booking-modal-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('booking-success')?.classList.remove('show');
  const btn = document.getElementById('booking-submit-btn');
  if (btn) { btn.disabled = false; btn.style.display = ''; btn.innerHTML = 'Request Booking <i class="fas fa-arrow-right"></i>'; }
}

// Export to window
window.closeBookingModal = closeBookingModal;

// ---- VALIDATION UTILITIES ------------------------------------
function validateEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSAPhone(phone) {
  if (!phone) return false;
  const clean = phone.replace(/[^\d+]/g, '');
  return /^(\+27|0)[0-9]{9}$/.test(clean);
}

function normalizeSAPhone(phone) {
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('0')) return '+27' + clean.substring(1);
  if (clean.startsWith('27') && !clean.startsWith('+27')) return '+' + clean;
  return clean;
}

window.handleBookingSubmit = function(e) {
  e.preventDefault();
  const form    = document.getElementById('booking-form');
  const success = document.getElementById('booking-success');
  const btn     = document.getElementById('booking-submit-btn');
  if (!form) return;

  // Guest checkout is allowed; an account is optional and can be created later.
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  // Form Validation
  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = '#e74c3c';
      valid = false;
    }
  });
  if (!valid) return;

  const experience = document.getElementById('booking-experience').value;
  const guestEmail = (currentUser && currentUser.email) || document.getElementById('booking-email').value.trim();
  const date = document.getElementById('booking-date').value;
  const guests = parseInt(document.getElementById('booking-guests').value, 10);
  const notes = document.getElementById('booking-notes').value;

  if (!date) {
    alert("Please select an available scheduled date.");
    return;
  }

  // Find matching scheduled event
  const activeEvent = soloEvents.find(e => e.exp === experience && e.date === date);
  if (!activeEvent) {
    alert("The selected experience is not scheduled for this date.");
    return;
  }

  // Spots Verification
  if (activeEvent.spotsLeft < guests) {
    alert(`Sorry, only ${activeEvent.spotsLeft} spots are left for this experience.`);
    return;
  }

  const free = activeEvent.isFree;
  
  if (free) {
    // Process free reservation immediately
    // Generate booking reference before processing
    const bookingRef = 'SS-' + Date.now().toString(36).toUpperCase().slice(-4) + Math.floor(1000 + Math.random() * 9000);
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Reservation...';
    btn.disabled = true;

    setTimeout(() => {
      const newBooking = {
        id: bookingRef,
        userEmail: guestEmail,
        experience: experience,
        date: date,
        guests: guests,
        total: 0,
        price: 'FREE',
        location: activeEvent.location,
        status: 'Booked',
        notes: notes,
        createdAt: new Date().toISOString()
      };

      // Add to persistent bookings list
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      bookings.push(newBooking);
      localStorage.setItem('bookings', JSON.stringify(bookings));

      // Decrement spots
      activeEvent.spotsLeft -= guests;
      // Refresh event tables
      initEventsTable();

      // Show success with reference
      const successMsg = document.getElementById('booking-success');
      if (successMsg) {
        successMsg.innerHTML = `<div><i class="fas fa-check-circle"></i> Reserved! Ref: <strong>${escapeHtml(bookingRef)}</strong></div><div style="margin-top:12px;color:#5f6b64;font-size:13px;">A confirmation has been recorded for ${escapeHtml(guestEmail)}.</div><button type="button" class="btn btn-primary" style="margin-top:16px;" onclick="closeBookingModal()">Done</button>`;
      }
      form.classList.add('complete');
      success?.classList.add('show');
      success?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      btn.innerHTML = '<i class="fas fa-check-circle"></i> Reservation Confirmed!';
      btn.disabled = true;

      setTimeout(() => {
        form.reset();
        form.classList.remove('complete');
        success?.classList.remove('show');
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Reserved!';
        btn.style.display = '';
        btn.disabled = false;
        // Don't auto-close modal — let user read reference
        // closeBookingModal();
        // openPortal();
      }, 8000); // Extended: 8 seconds (was 1.8s)
    }, 1000);
  } else {
    // Paid booking: Open PayFast Direct Checkout
    const pricePerGuest = parseInt(activeEvent.price.replace('R', ''), 10);
    const totalAmount = pricePerGuest * guests;

    // Cache checkout details
    window.tempBooking = {
      userEmail: guestEmail,
      experience: experience,
      date: date,
      guests: guests,
      total: totalAmount,
      price: activeEvent.price,
      location: activeEvent.location,
      notes: notes,
      eventRef: activeEvent
    };

    const config = window.SOLO_CONFIG || {};
    if (config.paystackEnabled && activeEvent.id) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening secure checkout...';
      fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEvent.id,
          name: document.getElementById('booking-name').value.trim(),
          email: guestEmail,
          phone: document.getElementById('booking-phone').value.trim(),
          guests,
          notes
        })
      })
        .then(async res => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.authorization_url) throw new Error(data.error || 'Checkout unavailable');
          window.location.href = data.authorization_url;
        })
        .catch(err => {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-lock"></i> Pay & Book';
          alert('Secure checkout could not start: ' + err.message + '. Please try again, or contact us to arrange payment.');
        });
      return;
    }

    closeBookingModal();
    alert('Online card checkout is not available right now. Please contact SSoulZAR@outlook.com to arrange payment for this experience.');
  }
};

// ---- BLOG MODAL -------------------------------------------
window.openBlogModal = function(id) {
  const data    = blogContent[id];
  const overlay = document.getElementById('blog-modal-overlay');
  const content = document.getElementById('blog-modal-content');
  if (!data || !overlay || !content) return;

  content.innerHTML = `
    <img src="${data.image}" alt="${data.title}" class="blog-modal-img" />
    <div class="blog-modal-body">
      <span class="blog-modal-cat ${data.catClass}">${data.category}</span>
      <h2>${data.title}</h2>
      <div class="blog-modal-meta">${data.date} &nbsp;·&nbsp; ${data.readTime}</div>
      ${data.content}
    </div>
  `;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Scroll content to top
  overlay.querySelector('.modal')?.scrollTo(0, 0);
};

window.closeBlogModal = function(event) {
  // Called from ✕ button (no event) — close unconditionally.
  // Called from overlay onclick — only close if overlay itself was clicked.
  if (event && event.target !== document.getElementById('blog-modal-overlay')) return;
  document.getElementById('blog-modal-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
};

// ---- NEWSLETTER FORM --------------------------------------
window.handleNewsletterSubmit = function(e) {
  e.preventDefault();
  const input   = document.getElementById('newsletter-email');
  const success = document.getElementById('newsletter-success');
  const btn     = document.getElementById('newsletter-submit-btn');
  if (!input?.value || !input.value.includes('@')) {
    input.style.borderBottom = '2px solid #e74c3c';
    return;
  }
  input.style.borderBottom = '';
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  setTimeout(() => {
    success?.classList.add('show');
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.style.background = 'var(--forest)';
  }, 900);
};

// ---- CONTACT FORM ----------------------------------------
window.handleContactSubmit = function(e) {
  e.preventDefault();
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  const btn     = document.getElementById('contact-submit-btn');
  if (!form) return;

  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach(f => {
    f.style.borderColor = '';
    if (!f.value.trim()) { f.style.borderColor = '#e74c3c'; valid = false; }
  });
  if (!valid) return;

  // Enhanced email validation
  const emailInput = document.getElementById('contact-email');
  if (emailInput && !validateEmail(emailInput.value.trim())) {
    emailInput.style.borderColor = '#e74c3c';
    emailInput.focus();
    const errorDiv = document.getElementById('contact-error');
    if (errorDiv) errorDiv.textContent = 'Please enter a valid email address (e.g. name@domain.com)';
    return;
  }

  // SA phone validation
  const phoneInput = document.getElementById('contact-phone');
  if (phoneInput && phoneInput.value.trim() && !validateSAPhone(phoneInput.value.trim())) {
    phoneInput.style.borderColor = '#e74c3c';
    phoneInput.focus();
    const errorDiv = document.getElementById('contact-error');
    if (errorDiv) errorDiv.textContent = 'Please enter a valid SA number: +27821234567 or 0736192693';
    return;
  }

  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    success?.classList.add('show');
    form.reset();
    btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
    btn.disabled = false;
    setTimeout(() => success?.classList.remove('show'), 5000);
  }, 1200);
};

/* ============================================================
   UPGRADES: GUEST PORTAL, AUTHS, PAYFAST & TICKETS INTERACTION
   ============================================================ */

// ---- NAVIGATION PORTAL CONTROLLERS -------------------------
function openPortal(event) {
  if (event) event.preventDefault();
  
  // Close mobile navigation drawer if open
  document.getElementById('mobile-menu')?.classList.remove('active');
  document.getElementById('mobile-overlay')?.classList.remove('active');
  document.getElementById('hamburger')?.classList.remove('active');

  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    // Show Authentication Modal (Login / Register)
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Reset errors and fields
      document.getElementById('login-form')?.reset();
      document.getElementById('register-form')?.reset();
      document.getElementById('login-error').textContent = '';
      document.getElementById('register-error').textContent = '';
      switchAuthTab('login');
    }
  } else {
    // Show Dashboard Modal
    const overlay = document.getElementById('portal-modal-overlay');
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      loadPortalDashboard();
    }
  }
}

function closeAuthModal(event) {
  if (event && event.target !== document.getElementById('auth-modal-overlay')) return;
  document.getElementById('auth-modal-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function closePortalModal(event) {
  if (event && event.target !== document.getElementById('portal-modal-overlay')) return;
  document.getElementById('portal-modal-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login-container');
  const formRegister = document.getElementById('form-register-container');

  if (tab === 'login') {
    tabLogin?.classList.add('active');
    tabRegister?.classList.remove('active');
    formLogin?.classList.add('active');
    formRegister?.classList.remove('active');
  } else {
    tabLogin?.classList.remove('active');
    tabRegister?.classList.add('active');
    formLogin?.classList.remove('active');
    formRegister?.classList.add('active');
  }
}

// Export to window
window.openPortal = openPortal;
window.closeAuthModal = closeAuthModal;
window.closePortalModal = closePortalModal;
window.switchAuthTab = switchAuthTab;

// ---- ENHANCED AUTHENTICATION HANDLERS -----------------------

// Register with Supabase Auth (SECURITY FIX #1)
async function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const whatsapp = document.getElementById('register-whatsapp').value.trim();
  const password = document.getElementById('register-password').value;
  const errorEl = document.getElementById('register-error');

  // Input validation
  if (!name || !email || !whatsapp || !password) {
    errorEl.textContent = "Please fill in all registration fields.";
    return;
  }

  if (password.length < 8) {
    errorEl.textContent = "Password must be at least 8 characters for security.";
    return;
  }

  // South African phone validation
  const cleanPhone = whatsapp.replace(/[^\d+]/g, '');
  const validSAFormat = /^(\+27|0)[0-9]{9}$/.test(cleanPhone);
  if (!validSAFormat) {
    errorEl.textContent = 'Enter valid South African number: +27821234567 or 0821234567';
    return;
  }

  try {
    // Use Supabase Auth instead of localStorage (SECURITY FIX)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          phone: cleanPhone,
          preferred_categories: []
        }
      }
    });

    if (authError) {
      console.error('Auth Error:', authError);
      errorEl.textContent = authError.message || 'Registration failed';
      return;
    }

    if (!authData?.session) {
      errorEl.textContent = 'Registration failed. Please try again.';
      return;
    }

    updateNavbarLinks();
    closeAuthModal();

    // Open dashboard
    const currentUser = {
      name: authData.session.user.user_metadata.name || name,
      email: authData.session.user.email || email,
      phone: authData.session.user.user_metadata.phone || cleanPhone
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    openPortal();

  } catch (err) {
    console.error('Network error:', err);
    errorEl.textContent = 'Network error. Check connection.';
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  if (!email || !password) {
    errorEl.textContent = "Please enter email and password.";
    return;
  }

  try {
    // Use Supabase Auth for secure login (SECURITY FIX)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (authError) {
      console.error('Login error:', authError);
      errorEl.textContent = "Invalid email or password.";
      return;
    }

    updateNavbarLinks();
    closeAuthModal();

    // Get user profile after login
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = {
      name: session.user.user_metadata.name || 'Guest',
      email: session.user.email,
      phone: session.user.user_metadata.phone || ''
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    openPortal(); // Opens dashboard immediately

  } catch (err) {
    console.error('Network error:', err);
    errorEl.textContent = 'Network error during login.';
  }
}

async function handleLogout() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Logout error:', err);
  }
  localStorage.removeItem('currentUser');
  updateNavbarLinks();
  closePortalModal();
}

function updateNavbarLinks() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const desktopBtn = document.getElementById('nav-portal-btn');
  const mobileBtn = document.getElementById('mobile-portal-btn');

  if (currentUser) {
    const firstName = escapeHtml(String(currentUser.name || 'Guest').split(' ')[0]);
    const loggedInText = `<i class="fas fa-user-check"></i> Hi, ${firstName} ✦`;
    if (desktopBtn) desktopBtn.innerHTML = loggedInText;
    if (mobileBtn) mobileBtn.innerHTML = loggedInText;
  } else {
    const loggedOutText = `<i class="fas fa-user-circle"></i> My Portal`;
    if (desktopBtn) desktopBtn.innerHTML = loggedOutText;
    if (mobileBtn) mobileBtn.innerHTML = loggedOutText;
  }
}

// Export to window
window.handleRegisterSubmit = handleRegisterSubmit;
window.handleLoginSubmit = handleLoginSubmit;
window.handleLogout = handleLogout;
window.updateNavbarLinks = updateNavbarLinks;

// ---- GUEST DASHBOARD CONTROLLERS ----------------------------
function loadPortalDashboard() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  // Set Profile details
  document.getElementById('portal-user-name').textContent = currentUser.name;
  document.getElementById('portal-user-phone').textContent = currentUser.phone;
  document.getElementById('portal-user-email').textContent = currentUser.email;
  document.getElementById('portal-user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

  // Load preferences to UI checkboxes
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === currentUser.email);
  const prefs = (user && user.preferences) ? user.preferences : [];

  document.getElementById('pref-nature').checked = prefs.includes('nature');
  document.getElementById('pref-creative').checked = prefs.includes('creative');
  document.getElementById('pref-mindful').checked = prefs.includes('mindful');
  document.getElementById('pref-dining').checked = prefs.includes('dining');
  document.getElementById('pref-luxury').checked = prefs.includes('luxury');

  // Populate booking cards
  const container = document.getElementById('bookings-list-container');
  if (!container) return;

  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const userBookings = bookings.filter(b => b.userEmail === currentUser.email);

  if (userBookings.length === 0) {
    container.innerHTML = `
      <div class="portal-empty-state">
        <i class="fas fa-calendar-times"></i>
        <h5>No booked experiences yet</h5>
        <p>Your journey begins with taking the first step. Explore our upcoming Durban solo events and book an experience today!</p>
        <a href="experiences.html" class="btn btn-secondary" onclick="closePortalModal()" style="margin-top:10px; padding:10px 20px; font-size:13px;">View Experiences</a>
      </div>
    `;
    return;
  }

  // Sort bookings (latest first)
  userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let html = '<div class="bookings-grid">';
  userBookings.forEach(b => {
    let statusClass = 'unpaid';
    if (b.status === 'Paid') statusClass = 'paid';
    else if (b.status === 'Free') statusClass = 'free';

    html += `
      <div class="booking-card">
        <div class="booking-card-header">
          <h5>${escapeHtml(b.experience)}</h5>
          <span class="booking-status ${statusClass}">${escapeHtml(b.status)}</span>
        </div>
        <div class="booking-card-body">
          <div class="booking-details-list">
            <p><i class="fas fa-calendar-day"></i> Date: <strong>${escapeHtml(b.date)}</strong></p>
            <p><i class="fas fa-map-marker-alt"></i> Location: <span>${escapeHtml(b.location)}</span></p>
            <p><i class="fas fa-users"></i> Spots: <strong>${Number(b.guests) || 1} guest${b.guests > 1 ? 's' : ''}</strong></p>
            <p><i class="fas fa-coins"></i> Total Paid: <strong>${b.total === 0 ? 'FREE' : 'R' + escapeHtml(b.total)}</strong></p>
          </div>
          <div class="booking-actions">
            <button class="btn-ticket" onclick="openTicket('${escapeHtml(b.id)}')"><i class="fas fa-ticket-alt"></i> View Ticket</button>
            <button class="btn-cancel" onclick="cancelBooking('${escapeHtml(b.id)}')"><i class="fas fa-times-circle"></i> Cancel</button>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ---- DIGITAL TICKET CONTROLLERS -----------------------------
function openTicket(bookingId) {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return;

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const content = document.getElementById('ticket-modal-content');
  if (!content) return;

  // Generate simulated barcode lines
  let barcodeHtml = '';
  for(let i=0; i<32; i++) {
    const thickness = Math.floor(Math.random() * 4) + 1;
    barcodeHtml += `<span class="barcode-line" style="width: ${thickness}px;"></span>`;
  }

  content.innerHTML = `
    <div class="ticket-container">
      <div class="ticket-header">
        <h4>SOLO SOUL EXPERIENCES</h4>
        <p>Guest Admission Ticket</p>
      </div>
      <div class="ticket-body">
        <h3 class="ticket-title">${escapeHtml(booking.experience)}</h3>
        <div class="ticket-info-grid">
          <div class="ticket-info-item">
            <span>Attendee</span>
            <strong>${escapeHtml(currentUser ? currentUser.name : 'Guest')}</strong>
          </div>
          <div class="ticket-info-item">
            <span>Booking ID</span>
            <strong>${escapeHtml(booking.id)}</strong>
          </div>
          <div class="ticket-info-item">
            <span>Date</span>
            <strong>${escapeHtml(booking.date)}</strong>
          </div>
          <div class="ticket-info-item">
            <span>Spots Reserved</span>
            <strong>${Number(booking.guests) || 1}</strong>
          </div>
        </div>
        <div class="ticket-venue">
          <span>Location & Directions</span>
          <strong>${escapeHtml(booking.location)}</strong>
        </div>
        <p class="ticket-footer-msg">Please present this secure digital barcode on arrival. Wear comfortable clothes, bring your journal, and look forward to connecting with your own company. 💚</p>
      </div>
      <div class="ticket-perforation">
        <span class="ticket-notch left"></span>
        <span class="ticket-perforation-line"></span>
        <span class="ticket-notch right"></span>
      </div>
      <div class="ticket-barcode-section">
        <div class="ticket-barcode">
          ${barcodeHtml}
        </div>
        <div class="ticket-ref">REF-${escapeHtml(booking.id)}</div>
      </div>
    </div>
  `;

  // Open ticket modal
  const overlay = document.getElementById('ticket-modal-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeTicketModal(event) {
  if (event && event.target !== document.getElementById('ticket-modal-overlay')) return;
  document.getElementById('ticket-modal-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function cancelBooking(bookingId) {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  if (bookingIndex === -1) return;

  const booking = bookings[bookingIndex];
  const confirmCancel = confirm(`Are you sure you want to cancel your spot for "${booking.experience}" on ${booking.date}?`);
  if (!confirmCancel) return;

  // Find corresponding event to restore spots
  const targetEvent = soloEvents.find(e => {
    const firstWord = e.exp.toLowerCase().split(' ')[0];
    const bookWord = booking.experience.toLowerCase().split(' ')[0];
    return (e.exp.toLowerCase().includes(bookWord) || booking.experience.toLowerCase().includes(firstWord)) && e.date === booking.date;
  });

  if (targetEvent) {
    targetEvent.spotsLeft += booking.guests;
  }

  // Remove booking and update localStorage
  bookings.splice(bookingIndex, 1);
  localStorage.setItem('bookings', JSON.stringify(bookings));

  // Refresh tables and reload
  initEventsTable();
  loadPortalDashboard();
  alert("Your booking has been cancelled successfully. Any payment holds will be fully refunded.");
}

// Export to window
window.loadPortalDashboard = loadPortalDashboard;
window.openTicket = openTicket;
window.closeTicketModal = closeTicketModal;
window.cancelBooking = cancelBooking;

// ---- PAYFAST SIMULATOR GATEWAY CONTROLLERS -------------------
// Legacy demo checkout. It is intentionally unreachable from any public
// booking path: real card payments must go through Paystack. Keep the
// functions below so old pages/scripts fail safely instead of throwing.
function openPayFastModal(experience, date, guests, totalAmount) {
  console.warn('Legacy PayFast demo checkout is disabled. Use the Paystack checkout.');
  return;
}

function closePayFastModal(event) {
  // Prevent closing overlay by accident while payment is in progress
  const loadingView = document.getElementById('payfast-loading-view');
  const otpView = document.getElementById('payfast-otp-view');
  const loading = loadingView && loadingView.style.display === 'flex';
  const otp = otpView && otpView.style.display === 'flex';
  if ((loading || otp) && event) return; // ignore background clicks during transaction

  if (event && event.target !== document.getElementById('payfast-modal-overlay')) return;
  
  document.getElementById('payfast-modal-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

// Export to window
window.openPayFastModal = openPayFastModal;
window.closePayFastModal = closePayFastModal;

function switchPayFastMethod(method) {
  const tabCard = document.getElementById('pf-tab-card');
  const tabEFT = document.getElementById('pf-tab-eft');
  const contCard = document.getElementById('pf-method-card-container');
  const contEFT = document.getElementById('pf-method-eft-container');

  if (method === 'card') {
    tabCard?.classList.add('active');
    tabEFT?.classList.remove('active');
    contCard?.classList.add('active');
    contEFT?.classList.remove('active');
  } else {
    tabCard?.classList.remove('active');
    tabEFT?.classList.add('active');
    contCard?.classList.remove('active');
    contEFT?.classList.add('active');
  }
}

function formatCardNumber(input) {
  let v = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  let matches = v.match(/\d{4,16}/g);
  let match = matches && matches[0] || '';
  let parts = [];
  for (let i=0, len=match.length; i<len; i+=4) {
    parts.push(match.substring(i, i+4));
  }
  if (parts.length > 0) {
    input.value = parts.join(' ');
  } else {
    input.value = v;
  }
}

function formatCardExpiry(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length >= 2) {
    input.value = v.substring(0,2) + '/' + v.substring(2,4);
  } else {
    input.value = v;
  }
}

function handlePayFastCardSubmit(e) {
  e.preventDefault();
  const number = document.getElementById('pf-card-number').value.replace(/\s/g, '');
  const expiry = document.getElementById('pf-card-expiry').value;
  const cvv = document.getElementById('pf-card-cvv').value;

  if (number.length !== 16 || expiry.length !== 5 || cvv.length !== 3) {
    alert("Please enter a valid credit card details.");
    return;
  }

  // Go to verification loading screen
  document.getElementById('payfast-main-content').style.display = 'none';
  const loading = document.getElementById('payfast-loading-view');
  loading.style.display = 'flex';
  document.getElementById('pf-loader-status').textContent = "Securing transaction tunnel...";

  setTimeout(() => {
    document.getElementById('pf-loader-status').textContent = "Contacting issuing bank...";
    setTimeout(() => {
      // Transition to OTP verification
      loading.style.display = 'none';
      document.getElementById('payfast-otp-view').style.display = 'flex';
    }, 1200);
  }, 1000);
}

function startEFT(bankName) {
  document.getElementById('payfast-main-content').style.display = 'none';
  const loading = document.getElementById('payfast-loading-view');
  loading.style.display = 'flex';
  document.getElementById('pf-loader-status').textContent = `Securing tunnel with ${bankName} portal...`;

  setTimeout(() => {
    document.getElementById('pf-loader-status').textContent = "Waiting for bank multi-factor approval...";
    setTimeout(() => {
      loading.style.display = 'none';
      document.getElementById('otp-bank-name').textContent = `${bankName.toUpperCase()} MULTI-FACTOR SECURE`;
      document.getElementById('payfast-otp-view').style.display = 'flex';
    }, 1200);
  }, 1000);
}

function verifyOTP() {
  const otpInput = document.getElementById('pf-otp-input').value.trim();
  const errorEl = document.getElementById('pf-otp-error');
  if (otpInput.length < 4) {
    errorEl.textContent = "Please enter the valid OTP code.";
    return;
  }

  // Success flow
  errorEl.textContent = '';
  document.getElementById('payfast-otp-view').style.display = 'none';
  const loading = document.getElementById('payfast-loading-view');
  loading.style.display = 'flex';
  document.getElementById('pf-loader-status').textContent = "Authorizing credit transfer...";

  setTimeout(() => {
    loading.style.display = 'none';
    const success = document.getElementById('payfast-success-view');
    success.style.display = 'flex';
    
    const bookingRef = 'SS-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('pf-success-ref').textContent = bookingRef;

    // Commit booking transaction
    const bookingData = window.tempBooking;
    if (bookingData) {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const newBooking = {
        id: bookingRef,
        userEmail: bookingData.userEmail,
        experience: bookingData.experience,
        date: bookingData.date,
        guests: bookingData.guests,
        total: bookingData.total,
        price: bookingData.price,
        location: bookingData.location,
        status: 'Paid',
        notes: bookingData.notes,
        createdAt: new Date().toISOString()
      };
      bookings.push(newBooking);
      localStorage.setItem('bookings', JSON.stringify(bookings));

      // Decrement spots left reactively
      if (bookingData.eventRef) {
        bookingData.eventRef.spotsLeft -= bookingData.guests;
      }
      initEventsTable(); // Refresh slots count in table
    }

    setTimeout(() => {
      closePayFastModal();
      openPortal(); // Return directly to portal dashboard to display ticket!
    }, 2800);
  }, 1500);
}

function resendOTP() {
  alert("A new verification code has been dispatched to your registered profile details.");
}

// Export to window
window.switchPayFastMethod = switchPayFastMethod;
window.formatCardNumber = formatCardNumber;
window.formatCardExpiry = formatCardExpiry;
window.handlePayFastCardSubmit = handlePayFastCardSubmit;
window.startEFT = startEFT;
window.verifyOTP = verifyOTP;
window.resendOTP = resendOTP;

// ---- GUEST SETTINGS & ACCESSIBILITY CONTROLLERS ------------
function switchPortalTab(tabName) {
  // Hide all sections
  document.querySelectorAll('.portal-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.portal-tab').forEach(el => {
    el.classList.remove('active');
    el.style.borderBottom = '3px solid transparent';
    el.style.opacity = '0.7';
  });

  // Show active section
  const activeSec = document.getElementById(`portal-sec-${tabName}`);
  if (activeSec) activeSec.style.display = 'block';

  // Highlight tab button
  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.borderBottom = '3px solid var(--forest)';
    activeBtn.style.opacity = '1';
  }

  // If bookings tab is opened, reload dashboard booking listing
  if (tabName === 'bookings') {
    loadPortalDashboard();
  }
}

function saveUserPreferences() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const prefs = [];
  if (document.getElementById('pref-nature').checked) prefs.push('nature');
  if (document.getElementById('pref-creative').checked) prefs.push('creative');
  if (document.getElementById('pref-mindful').checked) prefs.push('mindful');
  if (document.getElementById('pref-dining').checked) prefs.push('dining');
  if (document.getElementById('pref-luxury').checked) prefs.push('luxury');

  // Save to currentUser session
  currentUser.preferences = prefs;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  // Save to accounts list
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex].preferences = prefs;
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Redraw schedule to update matches badges reactively
  initEventsTable();

  // Show status message
  const msgEl = document.getElementById('prefs-save-msg');
  if (msgEl) {
    msgEl.textContent = 'Preferences saved successfully! ✨';
    setTimeout(() => { msgEl.textContent = ''; }, 3000);
  }
}

function changeTheme(themeName) {
  if (themeName === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeName);
  }
  localStorage.setItem('user-theme', themeName);

  // Update visual selection borders in portal
  const selectorGrid = document.querySelector('.theme-selector-grid');
  if (selectorGrid) {
    selectorGrid.querySelectorAll('button').forEach(btn => {
      btn.style.border = '1px solid rgba(168,184,165,0.3)';
    });
  }
  // Target clicked button (cross-platform parent finding)
  const clickedBtn = event ? event.currentTarget : null;
  if (clickedBtn) {
    clickedBtn.style.border = '2px solid var(--forest)';
  }
}

function changeFontSize(sizeName) {
  document.documentElement.classList.remove('font-size-large', 'font-size-xlarge');
  if (sizeName === 'large') {
    document.documentElement.classList.add('font-size-large');
  } else if (sizeName === 'xlarge') {
    document.documentElement.classList.add('font-size-xlarge');
  }
  localStorage.setItem('user-font-size', sizeName);

  // Update button layouts
  document.querySelectorAll('.font-selector-grid button').forEach(btn => {
    btn.style.border = '1px solid var(--border)';
  });
  const activeBtn = document.getElementById(`font-size-${sizeName}`);
  if (activeBtn) {
    activeBtn.style.border = '2px solid var(--forest)';
  }
}

function toggleReduceMotion(shouldReduce) {
  if (shouldReduce) {
    document.body.classList.add('reduced-motion');
  } else {
    document.body.classList.remove('reduced-motion');
  }
  localStorage.setItem('user-reduce-motion', shouldReduce ? 'true' : 'false');
}

function initUserSettings() {
  // 1. Load theme preference
  const savedTheme = localStorage.getItem('user-theme') || 'default';
  if (savedTheme !== 'default') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // 2. Load font size accessibility
  const savedFontSize = localStorage.getItem('user-font-size') || 'standard';
  if (savedFontSize !== 'standard') {
    document.documentElement.classList.add(`font-size-${savedFontSize}`);
  }

  // 3. Load reduced motion accessibility
  const savedMotion = localStorage.getItem('user-reduce-motion') === 'true';
  if (savedMotion) {
    document.body.classList.add('reduced-motion');
    const cb = document.getElementById('ux-reduce-motion');
    if (cb) cb.checked = true;
  }
}

// Export functions to window
window.switchPortalTab = switchPortalTab;
window.saveUserPreferences = saveUserPreferences;
window.changeTheme = changeTheme;
window.changeFontSize = changeFontSize;
window.toggleReduceMotion = toggleReduceMotion;
window.initUserSettings = initUserSettings;

