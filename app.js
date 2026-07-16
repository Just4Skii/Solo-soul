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
    image: "assets/images/experience_coffee_journal_1783927404043.png",
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
    image: "assets/images/experience_nature_hike_1783927415406.png",
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
    image: "assets/images/gallery_cafe_1783927503191.png",
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
    image: "assets/images/experience_nature_hike_1783927415406.png",
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
const soloEvents = [
  { date: '28 Jul 2026', exp: 'Sunset Beach Walk',        location: 'Durban Beachfront, Golden Mile', duration: '1–2 hrs',  price: 'R250',  spots: 8,  category: 'nature',   spotsLeft: 3,  isFree: false },
  { date: '3 Aug 2026',  exp: 'Sip & Paint Evening',      location: 'Art Studio, Umhlanga',          duration: '3 hrs',    price: 'R450',  spots: 12, category: 'creative', spotsLeft: 5,  isFree: false },
  { date: '10 Aug 2026', exp: 'Solo Brunch Club',         location: 'Workshop 17, Waterfall',        duration: '2–3 hrs',  price: 'R350',  spots: 10, category: 'dining',   spotsLeft: 7,  isFree: false },
  { date: '17 Aug 2026', exp: 'Botanical Gardens Walk',   location: 'Durban Botanic Gardens, Berea', duration: '2 hrs',    price: 'FREE',  spots: 20, category: 'nature',   spotsLeft: 14, isFree: true  },
  { date: '24 Aug 2026', exp: 'Luxury Spa Solo Day',      location: 'Oyster Box Hotel, Umhlanga',    duration: 'Full day', price: 'R850',  spots: 6,  category: 'luxury',   spotsLeft: 2,  isFree: false },
  { date: '7 Sep 2026',  exp: 'Sunrise Coffee & Journal', location: 'Café 1999, Morningside',        duration: '1.5 hrs',  price: 'R150',  spots: 20, category: 'mindful',  spotsLeft: 15, isFree: false },
  { date: '14 Sep 2026', exp: 'Nature Hike — Krantzkloof',location: 'Krantzkloof Nature Reserve',    duration: '4 hrs',    price: 'R300',  spots: 12, category: 'nature',   spotsLeft: 4,  isFree: false },
  { date: '21 Sep 2026', exp: 'Solo Wine Tasting',        location: 'Chateau Gateaux, Hillcrest',    duration: '2.5 hrs',  price: 'R550',  spots: 8,  category: 'luxury',   spotsLeft: 6,  isFree: false },
  { date: '28 Sep 2026', exp: 'Morning Journaling Circle',location: 'Gateway Terrace, Umhlanga',     duration: '2 hrs',    price: 'FREE',  spots: 30, category: 'mindful',  spotsLeft: 22, isFree: true  },
  { date: '5 Oct 2026',  exp: 'Solo Sunset Picnic',       location: 'Umhlanga Lighthouse Reserve',   duration: '2 hrs',    price: 'R200',  spots: 15, category: 'nature',   spotsLeft: 10, isFree: false },
];

const cityEvents = [
  { title: 'Disney On Ice',                 date: '24 Jul – 3 Aug 2026', venue: 'Durban ICC, Durban',         link: 'https://www.webtickets.co.za/v2/search.aspx?search=Disney+On+Ice', icon: '🎭', source: 'Webtickets'    },
  { title: "Totalsports Women's Race",      date: '2 Aug 2026',          venue: 'Suncoast Casino, Durban',    link: 'https://www.totalsportswomensrace.co.za/durban-event/', icon: '🏃‍♀️', source: 'Official Site' },
  { title: 'Sjava in the Park',             date: '2 Aug 2026',          venue: 'Chris Saunders Park, Umhlanga', link: 'https://www.webtickets.co.za/v2/search.aspx?search=Sjava+in+the+Park', icon: '🎵', source: 'Webtickets'  },
  { title: 'Secret Sunrise Durban',         date: '1 Aug 2026',          venue: 'Northlands Girls High',      link: 'https://www.webtickets.co.za/v2/search.aspx?search=Secret+Sunrise+Durban', icon: '🌅', source: 'Webtickets'    },
  { title: 'Tamia LIVE in Durban',          date: '7 Aug 2026',          venue: 'Durban ICC, Durban',         link: 'https://www.webtickets.co.za/v2/search.aspx?search=Tamia+Durban', icon: '🎶', source: 'Webtickets'    },
  { title: 'Joseph Clark – Music of Queen', date: '31 Jul – 2 Aug 2026', venue: 'Playhouse Company, Durban',  link: 'https://tickets.computicket.com/search?q=Joseph+Clark+Queen', icon: '👑', source: 'Computicket'    },
  { title: 'Old Mutual Music at the Lake',  date: '24 Sep 2026',         venue: 'Durban Botanic Gardens',     link: 'https://www.webtickets.co.za/v2/search.aspx?search=Music+at+the+Lake+Durban', icon: '🎸', source: 'Webtickets'    },
  { title: 'Bafunny Bafunny Comedy Fest',   date: '19 Sep 2026',         venue: 'Suncoast Casino, Durban',    link: 'https://tickets.computicket.com/search?q=Bafunny+Bafunny', icon: '😂', source: 'Computicket'    },
  { title: 'Hollywoodbets Durban 10km',     date: '30 Aug 2026',         venue: 'Kingsmead, Durban',          link: 'https://www.runningcalendar.co.za/event/hollywoodbets-durban-10km/', icon: '🏅', source: 'Running Calendar' },
  { title: 'Harbour Boat Cruise',           date: 'Every weekend',       venue: "Wilson's Wharf, Durban",     link: 'https://www.wilsonswharf.co.za', icon: '⛵', source: 'Wilson\'s Wharf' },
  { title: 'Durban Botanic Gardens',        date: 'Open daily',          venue: 'Berea, Durban',              link: 'https://www.durbanbotanicgardens.org.za', icon: '🌿', source: 'Free Entry'  },
  { title: 'Hilton Arts Festival 2026',     date: '7–9 Aug 2026',        venue: 'Hilton College, PMB',        link: 'https://tickets.computicket.com/search?q=Hilton+Arts+Festival', icon: '🎨', source: 'Computicket'    },
];

// ---- DOM READY --------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initAOS();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initEventsTable();
  initEventFilters();
  initCityEvents();
  initTestimonials();
  initFAQ();
  initScrollToTop();
  initParallax();
  initStatCounters();
  updateNavbarLinks();
  initUserSettings();
});

// ---- PRELOADER --------------------------------------------
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      setTimeout(() => { preloader.style.display = 'none'; }, 700);
    }, 1800);
  });

  // Fallback
  setTimeout(() => {
    if (preloader && !preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      setTimeout(() => { preloader.style.display = 'none'; }, 700);
    }
  }, 3500);
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
      const offset = 80;
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

// ---- EVENTS TABLE -----------------------------------------
function initEventsTable() {
  const tbody = document.getElementById('events-tbody');
  if (!tbody) return;

  // Clear existing items in table first
  tbody.innerHTML = '';

  // Get current user preferences
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const prefs = (currentUser && currentUser.preferences) ? currentUser.preferences : [];

  soloEvents.forEach(evt => {
    const spotsClass = evt.spotsLeft <= 3 ? 'spots-low' : evt.spotsLeft <= 6 ? 'spots-mid' : 'spots-ok';
    const spotsText  = evt.isFree
      ? `<span class="spots-pill spots-ok">${evt.spotsLeft} free spots</span>`
      : (evt.spotsLeft <= 3
        ? `<span class="spots-pill spots-low">⚡ ${evt.spotsLeft} left!</span>`
        : `<span class="spots-pill ${spotsClass}">${evt.spotsLeft} spots</span>`);
    const priceDisplay = evt.isFree
      ? '<span style="color:#27ae60;font-weight:700;font-size:15px;">FREE</span>'
      : `<span class="event-price">${evt.price}</span>`;
    const btnLabel = evt.spotsLeft <= 0 ? 'Sold Out' : (evt.isFree ? 'Reserve Spot' : 'Book Now');
    const btnDisabled = evt.spotsLeft <= 0 ? 'disabled style="opacity:0.4;cursor:not-allowed"' : '';

    // Interest Match Badge
    let matchBadge = '';
    if (prefs.includes(evt.category)) {
      matchBadge = `<span class="pref-match-badge" title="Interest Match"><i class="fas fa-star"></i> Match</span>`;
    }

    const tr = document.createElement('tr');
    tr.dataset.category = evt.category;
    tr.dataset.spotsLeft = evt.spotsLeft;
    tr.dataset.expName   = evt.exp;
    tr.dataset.isFree    = evt.isFree ? '1' : '0';
    tr.innerHTML = `
      <td><strong>${evt.date}</strong></td>
      <td>
        <span class="event-name">${evt.exp}</span>
        <span class="event-cat-badge">${evt.category}</span>
        ${matchBadge}
      </td>
      <td><i class="fas fa-map-marker-alt" style="color:var(--sage);margin-right:6px;font-size:12px;"></i>${evt.location}</td>
      <td>${evt.duration}</td>
      <td>${priceDisplay}</td>
      <td>${spotsText}</td>
      <td><button class="book-event-btn" ${btnDisabled} onclick="openBookingModal('${evt.exp.replace(/'/g, "\\'").replace(/&/g, '&amp;')}', ${evt.spotsLeft}, ${evt.isFree})">${btnLabel}</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- EVENT FILTERS ----------------------------------------
function initEventFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('#events-tbody tr').forEach(row => {
        const match = filter === 'all' || row.dataset.category === filter;
        row.classList.toggle('hidden', !match);
      });
    });
  });
}

// ---- CITY EVENTS ------------------------------------------
function initCityEvents() {
  const grid = document.getElementById('city-events-grid');
  if (!grid) return;

  cityEvents.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'city-event-card';
    card.innerHTML = `
      <div class="city-event-icon">${ev.icon}</div>
      <h5>${ev.title}</h5>
      <div class="ced"><i class="fas fa-calendar" style="margin-right:6px;"></i>${ev.date}</div>
      <div class="cev"><i class="fas fa-map-marker-alt" style="margin-right:6px;"></i>${ev.venue}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
        <span style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.35);">${ev.source}</span>
        <a href="${ev.link}" target="_blank" rel="noopener noreferrer" class="city-event-link">
          Tickets <i class="fas fa-external-link-alt" style="font-size:10px;"></i>
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
  const matchingEvents = soloEvents.filter(e => {
    const firstWord = e.exp.toLowerCase().split(' ')[0];
    const expWord = experienceName.toLowerCase().split(' ')[0];
    return e.exp.toLowerCase().includes(expWord) || experienceName.toLowerCase().includes(firstWord);
  });
  
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

window.handleBookingSubmit = function(e) {
  e.preventDefault();
  const form    = document.getElementById('booking-form');
  const success = document.getElementById('booking-success');
  const btn     = document.getElementById('booking-submit-btn');
  if (!form) return;

  // Enforce Guest Portal Account Registration/Login
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    alert("Please log in or register a guest account to complete your booking.");
    closeBookingModal();
    openPortal(); // Opens portal auth modal
    return;
  }

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
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reserving...';
    btn.disabled = true;

    setTimeout(() => {
      const bookingId = 'SS-' + Math.floor(100000 + Math.random() * 900000);
      const newBooking = {
        id: bookingId,
        userEmail: currentUser.email,
        experience: experience,
        date: date,
        guests: guests,
        total: 0,
        price: 'FREE',
        location: activeEvent.location,
        status: 'Free',
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

      success?.classList.add('show');
      btn.style.display = 'none';

      setTimeout(() => {
        form.reset();
        success?.classList.remove('show');
        btn.style.display = '';
        btn.disabled = false;
        closeBookingModal();
        openPortal(); // Load dashboard to see ticket
      }, 1800);
    }, 1000);
  } else {
    // Paid booking: Open PayFast Direct Checkout
    const pricePerGuest = parseInt(activeEvent.price.replace('R', ''), 10);
    const totalAmount = pricePerGuest * guests;

    // Cache checkout details
    window.tempBooking = {
      userEmail: currentUser.email,
      experience: experience,
      date: date,
      guests: guests,
      total: totalAmount,
      price: activeEvent.price,
      location: activeEvent.location,
      notes: notes,
      eventRef: activeEvent
    };

    closeBookingModal();
    openPayFastModal(experience, date, guests, totalAmount);
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

// ---- AUTHENTICATION HANDLERS --------------------------------
function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const whatsapp = document.getElementById('register-whatsapp').value.trim();
  const password = document.getElementById('register-password').value;
  const errorEl = document.getElementById('register-error');

  if (!name || !email || !whatsapp || !password) {
    errorEl.textContent = "Please fill in all registration fields.";
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = "Password must be at least 6 characters.";
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userExists = users.some(u => u.email === email);
  if (userExists) {
    errorEl.textContent = "Email address already registered.";
    return;
  }

  // Create and save account
  const newUser = { name, email, phone: whatsapp, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // Log in immediately
  localStorage.setItem('currentUser', JSON.stringify({ name, email, phone: whatsapp }));
  updateNavbarLinks();
  closeAuthModal();
  openPortal(); // Opens dashboard immediately
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  if (!email || !password) {
    errorEl.textContent = "Please enter email and password.";
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    errorEl.textContent = "Invalid email or password.";
    return;
  }

  // Log in session
  localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email, phone: user.phone }));
  updateNavbarLinks();
  closeAuthModal();
  openPortal(); // Opens dashboard immediately
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  updateNavbarLinks();
  closePortalModal();
}

function updateNavbarLinks() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const desktopBtn = document.getElementById('nav-portal-btn');
  const mobileBtn = document.getElementById('mobile-portal-btn');

  if (currentUser) {
    const firstName = currentUser.name.split(' ')[0];
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
        <a href="#experiences" class="btn btn-secondary" onclick="closePortalModal()" style="margin-top:10px; padding:10px 20px; font-size:13px;">View Experiences</a>
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
          <h5>${b.experience}</h5>
          <span class="booking-status ${statusClass}">${b.status}</span>
        </div>
        <div class="booking-card-body">
          <div class="booking-details-list">
            <p><i class="fas fa-calendar-day"></i> Date: <strong>${b.date}</strong></p>
            <p><i class="fas fa-map-marker-alt"></i> Location: <span>${b.location}</span></p>
            <p><i class="fas fa-users"></i> Spots: <strong>${b.guests} guest${b.guests > 1 ? 's' : ''}</strong></p>
            <p><i class="fas fa-coins"></i> Total Paid: <strong>${b.total === 0 ? 'FREE' : 'R' + b.total}</strong></p>
          </div>
          <div class="booking-actions">
            <button class="btn-ticket" onclick="openTicket('${b.id}')"><i class="fas fa-ticket-alt"></i> View Ticket</button>
            <button class="btn-cancel" onclick="cancelBooking('${b.id}')"><i class="fas fa-times-circle"></i> Cancel</button>
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
        <h3 class="ticket-title">${booking.experience}</h3>
        <div class="ticket-info-grid">
          <div class="ticket-info-item">
            <span>Attendee</span>
            <strong>${currentUser ? currentUser.name : 'Guest'}</strong>
          </div>
          <div class="ticket-info-item">
            <span>Booking ID</span>
            <strong>${booking.id}</strong>
          </div>
          <div class="ticket-info-item">
            <span>Date</span>
            <strong>${booking.date}</strong>
          </div>
          <div class="ticket-info-item">
            <span>Spots Reserved</span>
            <strong>${booking.guests}</strong>
          </div>
        </div>
        <div class="ticket-venue">
          <span>Location & Directions</span>
          <strong>${booking.location}</strong>
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
        <div class="ticket-ref">REF-${booking.id}</div>
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
function openPayFastModal(experience, date, guests, totalAmount) {
  const overlay = document.getElementById('payfast-modal-overlay');
  if (!overlay) return;

  // Set fields
  document.getElementById('pf-experience-title').textContent = experience;
  document.getElementById('pf-experience-date').textContent = date;
  document.getElementById('pf-experience-guests').textContent = `${guests} spot${guests > 1 ? 's' : ''}`;
  document.getElementById('pf-total-amount').textContent = `R${totalAmount}.00`;
  
  // Clear inputs & views
  document.getElementById('payfast-card-form')?.reset();
  document.getElementById('pf-otp-input').value = '';
  document.getElementById('pf-otp-error').textContent = '';

  // Reset checkout views
  document.getElementById('payfast-main-content').style.display = 'grid';
  document.getElementById('payfast-loading-view').style.display = 'none';
  document.getElementById('payfast-otp-view').style.display = 'none';
  document.getElementById('payfast-success-view').style.display = 'none';

  switchPayFastMethod('card');

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePayFastModal(event) {
  // Prevent closing overlay by accident while payment is in progress
  const loading = document.getElementById('payfast-loading-view').style.display === 'flex';
  const otp = document.getElementById('payfast-otp-view').style.display === 'flex';
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

