import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const params = new URLSearchParams(window.location.search);
const initialTicket = params.get('ticket') || params.get('ref') || '';

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
        {['bookings','payments','support'].map(t => (
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

function Shell({ children, user, onSignOut }) {
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <a href="/" className="portal-brand"><img src="/assets/images/logo.png" alt="" /> Solo Soul</a>
        <nav><a href="/">Home</a><a href="/experiences.html">Experiences</a><a href="/help.html">Help</a></nav>
        {user && <div className="portal-user"><span>{user.email}</span><button onClick={onSignOut}>Sign out</button></div>}
      </header>
      <main className="portal-main">{children}</main>
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
      <div className="portal-actions"><button className="portal-btn" onClick={() => window.print()}>Print / save PDF</button><a className="portal-btn ghost" href="/portal/">My bookings</a></div>
    </div>
  );
}

export default App;
