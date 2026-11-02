import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const params = new URLSearchParams(window.location.search);
const initialTicket = params.get('ticket') || params.get('ref') || '';
const pathEvent = (window.location.pathname.match(/\/whats-on\/([^/]+)\/?$/) || [])[1] || '';
const initialEvent = params.get('event') || decodeURIComponent(pathEvent);
const initialExperience = params.get('experience') || '';
const initialBook = params.get('book') || '';

function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [booted, setBooted] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [support, setSupport] = useState([]);
  const [thread, setThread] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [bookExperience, setBookExperience] = useState(null);
  const [ticketEmail, setTicketEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const cfg = await fetch('/api/public-config').then(r => r.json()).catch(() => ({}));
      if (!cfg.supabaseUrl) { setError('Account service unavailable.'); setBooted(true); return; }
      const client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      setSupabase(client);
      const { data } = await client.auth.getSession();
      setSession(data.session);
      client.auth.onAuthStateChange((_e, next) => setSession(next));
      setBooted(true);
      if (initialTicket) loadTicket(client, data.session, '');
      if (initialEvent) loadExternalEvent(initialEvent);
      if (initialExperience) loadExperience(initialExperience);
      if (initialBook) loadBookingExperience(initialBook);
    })();
  }, []);

  const authed = Boolean(session);

  useEffect(() => {
    if (authed) { loadBookings(); loadPayments(); loadSupport(); }
  }, [authed]);

  async function api(action, body = {}, client = supabase, activeSession = session) {
    const headers = { 'Content-Type': 'application/json' };
    if (activeSession) headers.Authorization = `Bearer ${activeSession.access_token}`;
    const res = await fetch('/api/app', { method: 'POST', headers, body: JSON.stringify({ action, ...body }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }


  async function loadExternalEvent(id) {
    try {
      const data = await fetch('/api/events').then(r => r.json());
      const found = (data.events || []).find(e => e.id === id || e.slug === id);
      if (!found) throw new Error('Event not found');
      setEventDetail({ type: 'external', ...found });
    } catch (e) { setError(e.message); }
  }

  async function loadBookingExperience(id) {
    try {
      const data = await api('experience', { id });
      setBookExperience(data.experience);
    } catch (e) { setError(e.message); }
  }

  async function loadExperience(id) {
    try {
      const data = await api('experience', { id });
      setEventDetail({ type: 'own', ...data.experience });
    } catch (e) { setError(e.message); }
  }

  async function loadBookings() {
    try { const d = await api('my-bookings'); setBookings(d.bookings || []); setSupport(d.support || []); } catch (e) { setError(e.message); }
  }
  async function loadPayments() {
    try { const d = await api('payments'); setPayments(d.payments || []); } catch (e) { setError(e.message); }
  }
  async function loadSupport() {
    try { const d = await api('my-bookings'); setSupport(d.support || []); } catch (e) { setError(e.message); }
  }

  async function login(e) {
    e.preventDefault(); setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value });
    if (error) setError(error.message);
    setLoading(false);
  }

  async function register(e) {
    e.preventDefault(); setError(''); setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: e.target.email.value,
      password: e.target.password.value,
      options: { data: { full_name: e.target.name.value } },
    });
    if (error) setError(error.message);
    else if (!data.session) setError('Check your email to confirm the account, then sign in.');
    setLoading(false);
  }

  async function loadTicket(client, activeSession, email) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (activeSession) headers.Authorization = `Bearer ${activeSession.access_token}`;
      const res = await fetch('/api/app', { method: 'POST', headers, body: JSON.stringify({ action: 'booking', ref: initialTicket, email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ticket not found');
      setTicket(data.booking);
    } catch (e) { setError(e.message); }
  }

  async function openThread(id) {
    const d = await api('support/get', { id });
    setThread(d);
  }

  async function replyThread(message) {
    if (!message.trim()) return;
    await api('support/reply', { id: thread.ticket.id, message });
    openThread(thread.ticket.id);
  }

  async function requestRefund(ref) {
    const reason = window.prompt('Why are you requesting a refund?');
    if (!reason) return;
    try { await api('request-refund', { ref, reason }); await loadBookings(); alert('Refund request submitted.'); } catch (e) { alert(e.message); }
  }

  async function cancelBooking(ref) {
    if (!window.confirm('Cancel booking ' + ref + '?')) return;
    try { const r = await api('cancel-booking', { ref }); await loadBookings(); alert(r.refund_review ? 'Cancelled. A refund review was opened.' : 'Cancelled.'); } catch (e) { alert(e.message); }
  }

  async function createTicket(e) {
    e.preventDefault(); setError('');
    try {
      await api('support/create', {
        email: e.target.email.value,
        name: e.target.name.value,
        booking_ref: e.target.ref.value || null,
        category: e.target.category.value,
        subject: `${e.target.category.value} help — ${e.target.ref.value || e.target.name.value}`,
        message: e.target.message.value,
      });
      e.target.reset(); await loadSupport(); alert('Support ticket created.');
    } catch (err) { setError(err.message); }
  }

  if (!booted) return <div className="portal-loading">Loading your account…</div>;

  if (initialTicket && !ticket) {
    return (
      <Shell>
        <div className="portal-card portal-narrow">
          <h1>Your ticket</h1>
          {session ? <p>Loading ticket…</p> : (
            <>
              <p>Enter the email used for this booking.</p>
              <input value={ticketEmail} onChange={e => setTicketEmail(e.target.value)} placeholder="you@example.com" />
              <button className="portal-btn" onClick={() => loadTicket(supabase, null, ticketEmail)}>View ticket</button>
            </>
          )}
          {error && <p className="portal-error">{error}</p>}
        </div>
      </Shell>
    );
  }

  if (ticket) return <Shell><Ticket booking={ticket} /></Shell>;

  if (bookExperience) return <Shell><BookingView experience={bookExperience} session={session} /></Shell>;

  if (eventDetail) return <Shell><EventDetail event={eventDetail} /></Shell>;

  if (!authed) {
    return (
      <Shell>
        <div className="portal-grid">
          <form className="portal-card" onSubmit={login}>
            <h2>Welcome back</h2>
            <label>Email<input name="email" type="email" required autoComplete="email" /></label>
            <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
            <button className="portal-btn" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <form className="portal-card" onSubmit={register}>
            <h2>Create your account</h2>
            <label>Full name<input name="name" required autoComplete="name" /></label>
            <label>Email<input name="email" type="email" required autoComplete="email" /></label>
            <label>Password<input name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
            <button className="portal-btn" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
          </form>
        </div>
        {error && <p className="portal-error">{error}</p>}
      </Shell>
    );
  }

  const paid = bookings.filter(b => b.status === 'Paid');
  const total = paid.reduce((s, b) => s + Number(b.total || 0), 0);

  return (
    <Shell user={session.user} onSignOut={() => supabase.auth.signOut()}>
      <div className="portal-tabs">
        {['bookings','calendar','payments','support'].map(t => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {error && <p className="portal-error">{error}</p>}
      {tab === 'bookings' && (
        <div className="portal-stack">
          {bookings.length === 0 && <div className="portal-card"><h2>No bookings yet</h2><a className="portal-btn" href="/experiences.html">Browse experiences</a></div>}
          {bookings.map(b => (
            <div className="portal-card portal-row" key={b.id}>
              <div>
                <h3>{b.event_name}</h3>
                <p>{b.event_date} · {b.event_location}<br />{b.guests} guest(s) · {b.booking_ref} · R{Number(b.total).toFixed(2)}</p>
                <span className={`portal-badge ${b.status.toLowerCase()}`}>{b.status}</span>
              </div>
              <div className="portal-actions">
                {(b.status === 'Paid' || b.status === 'Free') && <a className="portal-btn" href={`/portal/?ticket=${b.booking_ref}`}>Ticket</a>}
                {b.status === 'Paid' && !b.refund && <button className="portal-btn ghost" onClick={() => requestRefund(b.booking_ref)}>Refund</button>}
                {!['Cancelled','Refunded'].includes(b.status) && <button className="portal-btn ghost" onClick={() => cancelBooking(b.booking_ref)}>Cancel</button>}
                {b.refund && <span className="portal-badge">Refund {b.refund.status}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'calendar' && <Calendar bookings={bookings} />}
      {tab === 'payments' && (
        <div className="portal-stack">
          <div className="portal-card portal-row"><div><h3>Total paid</h3><p>{paid.length} paid booking(s)</p></div><strong className="portal-total">R{total.toFixed(2)}</strong></div>
          {payments.length === 0 && <div className="portal-card"><p>No payments yet.</p></div>}
          {payments.map(p => (
            <div className="portal-card portal-row" key={p.id}>
              <div><h3>{p.booking?.event_name || 'Payment'}</h3><p>{p.provider_reference} · {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-ZA') : ''}</p></div>
              <div><strong>R{Number(p.amount).toFixed(2)}</strong><span className={`portal-badge ${p.status}`}>{p.status}</span></div>
            </div>
          ))}
        </div>
      )}
      {tab === 'support' && (
        <div className="portal-grid portal-support">
          <div className="portal-stack">
            {support.length === 0 && <div className="portal-card"><p>No support tickets yet.</p></div>}
            {support.map(t => (
              <button className="portal-card portal-thread" key={t.id} onClick={() => openThread(t.id)}>
                <strong>{t.subject}</strong><span>{t.category} · {t.status}</span>
              </button>
            ))}
            {thread && (
              <div className="portal-card">
                <h3>{thread.ticket.subject}</h3>
                {(thread.messages || []).map(m => <div className="portal-message" key={m.id}><strong>{m.author_name || m.author_type}</strong><p>{m.message}</p></div>)}
                <form onSubmit={e => { e.preventDefault(); replyThread(e.target.reply.value); e.target.reset(); }}>
                  <textarea name="reply" rows="3" placeholder="Reply…" />
                  <button className="portal-btn">Send reply</button>
                </form>
              </div>
            )}
          </div>
          <form className="portal-card" onSubmit={createTicket}>
            <h2>Need help?</h2>
            <label>Name<input name="name" required /></label>
            <label>Email<input name="email" type="email" defaultValue={session.user.email} required /></label>
            <label>Booking reference<input name="ref" placeholder="Optional" /></label>
            <label>Topic<select name="category"><option value="booking">Booking</option><option value="payment">Payment</option><option value="refund">Refund</option><option value="experience">Experience</option><option value="account">Account</option><option value="other">Other</option></select></label>
            <label>Message<textarea name="message" rows="4" required /></label>
            <button className="portal-btn">Send to support</button>
          </form>
        </div>
      )}
    </Shell>
  );
}


function icsDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function downloadCalendar(bookings) {
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Solo Soul Experiences//EN','CALSCALE:GREGORIAN'];
  bookings.forEach(b => {
    lines.push('BEGIN:VEVENT');
    lines.push('UID:' + b.booking_ref + '@ssoul.co.za');
    lines.push('DTSTAMP:' + icsDate(new Date()));
    lines.push('DTSTART;VALUE=DATE:' + icsDate(b.event_date).slice(0, 8));
    lines.push('SUMMARY:' + b.event_name);
    lines.push('LOCATION:' + (b.event_location || ''));
    lines.push('DESCRIPTION:Booking ' + b.booking_ref + ' · ' + b.guests + ' guest(s) · https://ssoul.co.za/portal/?ticket=' + b.booking_ref);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'solo-soul-bookings.ics'; a.click();
  URL.revokeObjectURL(a.href);
}

function googleCalendar(booking) {
  const date = icsDate(booking.event_date).slice(0, 8);
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', booking.event_name);
  url.searchParams.set('dates', date + '/' + date);
  url.searchParams.set('location', booking.event_location || '');
  url.searchParams.set('details', 'Booking ' + booking.booking_ref + ' · https://ssoul.co.za/portal/?ticket=' + booking.booking_ref);
  return url.toString();
}

function shareLink(title, text, url) {
  if (navigator.share) return navigator.share({ title, text, url }).catch(() => {});
  navigator.clipboard?.writeText(url).then(() => alert('Link copied'));
}

function Calendar({ bookings }) {
  const [cursor, setCursor] = React.useState(() => new Date());
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first); start.setDate(1 - first.getDay());
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const byDay = {};
  bookings.forEach(b => { const key = new Date(b.event_date).toDateString(); (byDay[key] = byDay[key] || []).push(b); });
  const label = cursor.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  return (
    <div className="portal-stack">
      <div className="portal-card portal-row">
        <div><h2 style={{ margin: 0 }}>{label}</h2><p>Your booked experiences.</p></div>
        <div className="portal-actions">
          <button className="portal-btn ghost" onClick={() => setCursor(new Date(year, month - 1, 1))}>←</button>
          <button className="portal-btn ghost" onClick={() => setCursor(new Date())}>Today</button>
          <button className="portal-btn ghost" onClick={() => setCursor(new Date(year, month + 1, 1))}>→</button>
        </div>
      </div>
      <div className="portal-card portal-calendar">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div className="cal-head" key={d}>{d}</div>)}
        {days.map((d, i) => {
          const items = byDay[d.toDateString()] || [];
          const inMonth = d.getMonth() === month;
          return <div key={i} className={'cal-day' + (inMonth ? '' : ' muted') + (items.length ? ' has' : '')}>
            <span>{d.getDate()}</span>
            {items.map(b => <button key={b.id} className="cal-event" onClick={() => window.location.href = '/portal/?ticket=' + b.booking_ref}>{b.event_name}</button>)}
          </div>;
        })}
      </div>
      <div className="portal-actions">
        <button className="portal-btn" onClick={() => downloadCalendar(bookings)}>Download calendar (.ics)</button>
      </div>
    </div>
  );
}

function EventDetail({ event }) {
  const external = event.type === 'external';
  const title = external ? event.title : event.event_name;
  const date = external ? event.dateLabel : event.date;
  const venue = external ? event.venue : event.location;
  const price = external ? event.price : (event.is_free ? 'FREE' : event.price);
  const fallback = {
    creative: '/assets/images/experience_sip_paint_1783927393574.webp',
    food: '/assets/images/experience_brunch_1783927375716.webp',
    outdoors: '/assets/images/experience_sunset_walk_1783927384287.webp',
    wellness: '/assets/images/experience_coffee_journal_1783927404043.webp',
    luxury: '/assets/images/experience_luxury_spa_1783927426028.webp',
    fitness: '/assets/images/experience_nature_hike_1783927415406.webp',
  }[event.category] || '/assets/images/experience_sunset_walk_1783927384287.webp';
  const image = event.image || event.image_url || fallback;
  const key = event.slug || event.id || '';
  const url = 'https://ssoul.co.za/portal/?event=' + encodeURIComponent(key);
  return (
    <div className="portal-event-page">
      <nav className="portal-breadcrumb"><a href="/events">Events</a><span>/</span><span>Durban</span></nav>
      <div className="portal-event-grid">
        <div className="portal-event-main">
          <div className="portal-event-media">{image ? <img src={image} alt={title} /> : <div className="portal-event-fallback">SS</div>}</div>
          <div className="portal-event-head">
            <div className="portal-event-tags"><span className="portal-badge">{external ? 'Partner listing' : 'Solo Soul Experiences'}</span><span className="portal-badge">{event.category || 'Experience'}</span></div>
            <h1>{title}</h1>
            <div className="portal-event-facts">
              <div><span>Date</span><strong>{date}</strong></div>
              <div><span>Venue</span><strong>{venue}</strong></div>
              <div><span>Price</span><strong>{price}</strong></div>
            </div>
            <p className="portal-event-description">{event.description || (external ? `Listed by ${event.source}. Check the organiser’s page for the full line-up, inclusions and accessibility details.` : 'A small-group Solo Soul experience in Durban. Full joining details are shared after booking.')}</p>
          </div>
          <div className="portal-share">
            <span>Share this</span>
            <button onClick={() => shareLink(title, title + ' — Solo Soul Experiences', url)}>Share</button>
            <a href={'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url)} target="_blank" rel="noreferrer">WhatsApp</a>
            <a href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)} target="_blank" rel="noreferrer">Facebook</a>
            <a href={'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(url)}>Email</a>
          </div>
        </div>
        <aside className="portal-event-aside">
          <div className="portal-card">
            <span className="portal-aside-label">{external ? 'Curated partner listing' : 'Hosted by Solo Soul'}</span>
            <strong className={/^[R\d]/.test(String(price)) ? "portal-total" : "portal-price-note"}>{price}</strong>
            <p>{date}<br />{venue}</p>
            {external
              ? <a className="portal-btn" href={event.url} target="_blank" rel="noreferrer">Get tickets ↗</a>
              : <a className="portal-btn" href={'/portal/?book=' + event.id}>Book this experience</a>}
            <a className="portal-btn ghost" href="/events" style={{ marginTop: 8 }}>Back to events</a>
            <div className="portal-aside-note">
              <strong>Good to know</strong>
              <span>{external ? 'Tickets are fulfilled by the partner organiser. Their name appears at checkout.' : 'Small group, hosted, and confirmed by email.'}</span>
              <span>{external ? 'Always confirm the date and venue on the ticket page before paying.' : 'Free cancellation up to 48 hours before, unless stated otherwise.'}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Shell({ children, user, onSignOut }) {
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <a href="/" className="portal-brand"><img src="/assets/images/logo.png" alt="" /> Solo Soul</a>
        <nav><a href="/about">About</a><a href="/experiences">Experiences</a><a href="/events">Events</a><a href="/gallery">Gallery</a><a href="/journal">Journal</a><a href="/contact">Contact</a></nav>
        <a className="portal-header-cta" href="/experiences">Book Now</a>
        {user && <div className="portal-user"><span>{user.email}</span><button onClick={onSignOut}>Sign out</button></div>}
      </header>
      <main className="portal-main">{children}</main>
      <footer className="portal-footer"><div><strong>Solo Soul Experiences</strong><span>Durban, KwaZulu-Natal</span></div><div><a href="/about">About</a><a href="/help">Help</a><a href="/contact">Contact</a></div><div><a href="mailto:SSoulZAR@outlook.com">SSoulZAR@outlook.com</a><span>© {new Date().getFullYear()} Solo Soul</span></div></footer>
    </div>
  );
}

function Ticket({ booking }) {
  return (
    <div className="portal-ticket">
      <div className="portal-ticket-top"><span>SOLO SOUL EXPERIENCES</span><span>{booking.status}</span></div>
      <h1>{booking.event_name}</h1>
      <div className="portal-ticket-meta"><div><span>Date</span><strong>{booking.event_date}</strong></div><div><span>Venue</span><strong>{booking.event_location}</strong></div><div><span>Guests</span><strong>{booking.guests}</strong></div></div>
      <div className="portal-ticket-ref"><span>Booking reference</span><strong>{booking.booking_ref}</strong><span>Ticket code</span><strong>{booking.ticket_code}</strong></div>
      <div className="portal-actions"><button className="portal-btn" onClick={() => window.print()}>Print / save PDF</button><button className="portal-btn ghost" onClick={() => downloadCalendar([booking])}>Add to calendar</button><a className="portal-btn ghost" href={googleCalendar(booking)} target="_blank" rel="noreferrer">Google Calendar</a><button className="portal-btn ghost" onClick={() => shareLink(booking.event_name, 'I am going to ' + booking.event_name, 'https://ssoul.co.za/portal/?ticket=' + booking.booking_ref)}>Share</button></div>
    </div>
  );
}

export default App;
