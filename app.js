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
  { title: 'Disney On Ice',                 date: '24 Jul – 3 Aug 2026', venue: 'Durban ICC, Durban',         link: 'https://www.webtickets.co.za', icon: '🎭', source: 'Webtickets'    },
  { title: "Totalsports Women's Race",      date: '2 Aug 2026',          venue: 'Suncoast Casino, Durban',    link: 'https://totalsportswomensrace.co.za', icon: '🏃‍♀️', source: 'Official Site' },
  { title: 'Sjava in the Park',             date: '2 Aug 2026',          venue: 'Chris Saunders Park, Umhlanga', link: 'https://www.webtickets.co.za', icon: '🎵', source: 'Webtickets'  },
  { title: 'Secret Sunrise Durban',         date: '1 Aug 2026',          venue: 'Northlands Girls High',      link: 'https://www.webtickets.co.za', icon: '🌅', source: 'Webtickets'    },
  { title: 'Tamia LIVE in Durban',          date: '7 Aug 2026',          venue: 'Durban ICC, Durban',         link: 'https://www.webtickets.co.za', icon: '🎶', source: 'Webtickets'    },
  { title: 'Joseph Clark – Music of Queen', date: '31 Jul – 2 Aug 2026', venue: 'Playhouse Company, Durban',  link: 'https://www.computicket.com', icon: '👑', source: 'Computicket'    },
  { title: 'Old Mutual Music at the Lake',  date: '24 Sep 2026',         venue: 'Durban Botanic Gardens',     link: 'https://www.webtickets.co.za', icon: '🎸', source: 'Webtickets'    },
  { title: 'Bafunny Bafunny Comedy Fest',   date: '19 Sep 2026',         venue: 'Suncoast Casino, Durban',    link: 'https://www.computicket.com', icon: '😂', source: 'Computicket'    },
  { title: 'Hollywoodbets Durban 10km',     date: '30 Aug 2026',         venue: 'Kingsmead, Durban',          link: 'https://www.runningcalendar.co.za', icon: '🏅', source: 'Running Calendar' },
  { title: 'Harbour Boat Cruise',           date: 'Every weekend',       venue: "Wilson's Wharf, Durban",     link: 'https://www.wilsonswharf.co.za', icon: '⛵', source: 'Wilson\'s Wharf' },
  { title: 'Durban Botanic Gardens',        date: 'Open daily',          venue: 'Berea, Durban',              link: 'https://www.durbanbotanicgardens.org.za', icon: '🌿', source: 'Free Entry'  },
  { title: 'Hilton Arts Festival 2026',     date: '7–9 Aug 2026',        venue: 'Hilton College, PMB',        link: 'https://www.computicket.com', icon: '🎨', source: 'Computicket'    },
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

// ---- BOOKING MODAL ----------------------------------------
window.openBookingModal = function(experienceName, spotsLeft, isFree) {
  const overlay      = document.getElementById('booking-modal-overlay');
  const selectEl     = document.getElementById('booking-experience');
  const dateInput    = document.getElementById('booking-date');
  const guestsEl     = document.getElementById('booking-guests');
  const titleEl      = document.getElementById('booking-modal-title');
  const subtitleEl   = document.getElementById('booking-modal-subtitle');
  const payNoteEl    = document.getElementById('booking-pay-note');
  const submitBtn    = document.getElementById('booking-submit-btn');
  if (!overlay) return;

  const free     = !!isFree;
  const maxSpots = (typeof spotsLeft === 'number' && spotsLeft > 0) ? spotsLeft : 10;

  // Update title & subtitle
  if (titleEl)    titleEl.textContent    = free ? 'Reserve Your Free Spot' : 'Book Your Experience';
  if (subtitleEl) subtitleEl.textContent = free
    ? "Secure your place — it's completely free. We'll confirm via WhatsApp."
    : "Fill in your details and we'll confirm within 24 hours via WhatsApp.";

  // Show/hide payment note
  if (payNoteEl) payNoteEl.style.display = free ? 'none' : 'flex';

  // Update submit button label
  if (submitBtn) submitBtn.innerHTML = free
    ? 'Reserve Free Spot <i class="fas fa-check"></i>'
    : 'Request Booking <i class="fas fa-arrow-right"></i>';

  // Rebuild guests dropdown — capped at available spots (max 10 shown)
  if (guestsEl) {
    guestsEl.innerHTML = '';
    const cap = Math.min(maxSpots, 10);
    for (let i = 1; i <= cap; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = i === 1 ? '1 guest (just me)' : `${i} guests`;
      guestsEl.appendChild(opt);
    }
    if (maxSpots <= 5) {
      const note = document.createElement('option');
      note.disabled = true;
      note.textContent = `── only ${maxSpots} spot${maxSpots > 1 ? 's' : ''} available ──`;
      guestsEl.appendChild(note);
    }
  }

  // Set min date to today
  if (dateInput) {
    const today = new Date();
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // Pre-select experience if provided
  if (experienceName && selectEl) {
    const clean = experienceName.replace(/&amp;/g, '&').replace(/&#39;/g, "'");
    const opts  = Array.from(selectEl.options);
    // Exact match first
    let match = opts.find(o => o.value === clean);
    // Then partial match on first 10 chars
    if (!match) match = opts.find(o => o.value && clean.toLowerCase().startsWith(o.value.toLowerCase().slice(0, 10)));
    // Fallback: first-word match
    if (!match) {
      const word = clean.toLowerCase().split(' ')[0];
      match = opts.find(o => o.value && o.value.toLowerCase().includes(word));
    }
    if (match) selectEl.value = match.value;
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeBookingModal = function(event) {
  // When called directly (from ✕ button), close unconditionally.
  // When called from the overlay onclick, only close if the overlay itself was clicked.
  if (event && event.target !== document.getElementById('booking-modal-overlay')) return;
  document.getElementById('booking-modal-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
  // Reset success state so next open is clean
  document.getElementById('booking-success')?.classList.remove('show');
  const btn = document.getElementById('booking-submit-btn');
  if (btn) { btn.disabled = false; btn.style.display = ''; btn.innerHTML = 'Request Booking <i class="fas fa-arrow-right"></i>'; }
};

window.handleBookingSubmit = function(e) {
  e.preventDefault();
  const form    = document.getElementById('booking-form');
  const success = document.getElementById('booking-success');
  const btn     = document.getElementById('booking-submit-btn');
  if (!form) return;

  // Simple validation
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

  // Show loading state
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
  btn.disabled = true;

  setTimeout(() => {
    success?.classList.add('show');
    btn.style.display = 'none';
    setTimeout(() => {
      form.reset();
      success?.classList.remove('show');
      btn.style.display = '';
      btn.innerHTML = 'Request Booking <i class="fas fa-arrow-right"></i>';
      btn.disabled = false;
      document.getElementById('booking-modal-overlay')?.classList.remove('active');
      document.body.style.overflow = '';
    }, 3500);
  }, 1000);
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
