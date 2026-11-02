/* Solo Soul — customer account */
(() => {
  let sb = null, session = null, activeRefund = null, activeSupport = null;

  const $ = (id) => document.getElementById(id);

  async function boot() {
    const cfg = await fetch('/api/public-config').then(r => r.json()).catch(() => ({}));
    if (!cfg.supabaseUrl || !window.supabase) {
      $('auth-message').textContent = 'Account service is unavailable. Please try again shortly.';
      return;
    }
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const { data } = await sb.auth.getSession();
    session = data.session;
    renderAuth();
    sb.auth.onAuthStateChange((_event, next) => { session = next; renderAuth(); });
    bindForms();
  }

  function renderAuth() {
    const authed = Boolean(session);
    $('auth-panel').hidden = authed;
    $('dashboard').hidden = !authed;
    if (authed) {
      $('account-name').textContent = session.user.user_metadata?.full_name || 'Your account';
      $('account-email').textContent = session.user.email;
      loadBookings();
      loadPayments();
    }
  }

  function bindForms() {
    $('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const { error } = await sb.auth.signInWithPassword({ email: $('login-email').value.trim(), password: $('login-password').value });
      $('auth-message').textContent = error ? error.message : '';
    });
    $('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const { data, error } = await sb.auth.signUp({
        email: $('register-email').value.trim(),
        password: $('register-password').value,
        options: { data: { full_name: $('register-name').value.trim() } },
      });
      if (error) return ($('auth-message').textContent = error.message);
      if (!data.session) $('auth-message').textContent = 'Check your email to confirm your account, then sign in.';
    });
    $('signout-btn').addEventListener('click', () => sb.auth.signOut());
    document.querySelectorAll('.account-tabs button').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
    $('refund-cancel').addEventListener('click', closeRefund);
    $('refund-submit').addEventListener('click', submitRefund);
  }

  function switchTab(tab) {
    document.querySelectorAll('.account-tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.account-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab));
    if (tab === 'bookings') loadBookings();
    if (tab === 'payments') loadPayments();
    if (tab === 'support') loadSupport();
  }

  async function api(action, body = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (session) headers.Authorization = 'Bearer ' + session.access_token;
    const res = await fetch('/api/app', { method: 'POST', headers, body: JSON.stringify({ action, ...body }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  function badge(status) {
    const safe = String(status || '').toLowerCase();
    return `<span class="badge ${safe}">${status}</span>`;
  }

  async function loadBookings() {
    const list = $('bookings-list');
    list.innerHTML = '<p class="auth-note">Loading your bookings…</p>';
    try {
      const data = await api('my-bookings');
      const bookings = data.bookings || [];
      if (!bookings.length) {
        list.innerHTML = '<div class="booking-card"><div><h3>No bookings yet</h3><p class="booking-meta">Your confirmed experiences will appear here.</p></div><a class="btn btn-primary" href="experiences.html">Browse experiences</a></div>';
        return;
      }
      list.innerHTML = bookings.map(b => {
        const paid = b.status === 'Paid' || b.status === 'Free';
        const ticket = paid ? `<a class="btn btn-primary" href="${b.ticket_url}" target="_blank">View ticket</a>` : '';
        const refund = b.refund ? `<span class="badge refunded">Refund ${b.refund.status}</span>` : (b.status === 'Paid' ? `<button class="btn btn-secondary" data-refund="${b.booking_ref}">Request refund</button>` : '');
        const cancel = !['Cancelled','Refunded'].includes(b.status) ? `<button class="btn btn-secondary" data-cancel="${b.booking_ref}">Cancel</button>` : '';
        return `<div class="booking-card">
          <div>
            <h3>${escapeHtml(b.event_name)}</h3>
            <div class="booking-meta">${escapeHtml(b.event_date)} · ${escapeHtml(b.event_location)}<br/>${b.guests} guest${b.guests > 1 ? 's' : ''} · ${escapeHtml(b.booking_ref)} · R${Number(b.total || 0).toFixed(2)}</div>
            <div style="margin-top:8px">${badge(b.status)}</div>
          </div>
          <div class="booking-actions">${ticket}${refund}${cancel}</div>
        </div>`;
      }).join('');
      list.querySelectorAll('[data-refund]').forEach(btn => btn.addEventListener('click', () => openRefund(btn.dataset.refund)));
      list.querySelectorAll('[data-cancel]').forEach(btn => btn.addEventListener('click', () => cancelBooking(btn.dataset.cancel)));
    } catch (error) {
      list.innerHTML = `<p class="auth-message">${escapeHtml(error.message)}</p>`;
    }
  }

  async function loadPayments() {
    const summary = $('payments-summary'), list = $('payments-list');
    list.innerHTML = '<p class="auth-note">Loading payments…</p>';
    try {
      const data = await api('payments');
      const payments = data.payments || [];
      const bookings = data.bookings || [];
      const paid = bookings.filter(b => b.status === 'Paid');
      const total = paid.reduce((sum, b) => sum + Number(b.total || 0), 0);
      summary.innerHTML = `<div class="booking-card"><div><h3>Total paid</h3><div class="booking-meta">${paid.length} paid booking${paid.length === 1 ? '' : 's'}</div></div><div style="font-family:'Playfair Display',serif;font-size:34px;color:#0B3C49">R${total.toFixed(2)}</div></div>`;
      if (!payments.length) {
        list.innerHTML = paid.length ? paid.map(b => `<div class="payment-row"><div><strong>${escapeHtml(b.event_name)}</strong><div class="booking-meta">${escapeHtml(b.booking_ref)} · ${escapeHtml(b.event_name)}</div></div><div style="text-align:right"><strong>R${Number(b.total).toFixed(2)}</strong><div class="booking-meta">${badge(b.status)}</div><button class="btn btn-secondary" data-receipt="${b.booking_ref}">Receipt</button></div></div>`).join('') : '<p class="auth-note">No payments yet.</p>';
      } else {
        list.innerHTML = payments.map(p => `<div class="payment-row"><div><strong>${escapeHtml(p.booking?.event_name || 'Payment')}</strong><div class="booking-meta">${escapeHtml(p.provider_reference || '')} · ${p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-ZA') : ''}</div></div><div style="text-align:right"><strong>R${Number(p.amount).toFixed(2)}</strong><div class="booking-meta">${badge(p.status)}</div><button class="btn btn-secondary" data-receipt="${p.booking?.booking_ref || ''}">Receipt</button></div></div>`).join('');
      }
      list.querySelectorAll('[data-receipt]').forEach(btn => btn.addEventListener('click', () => downloadReceipt(btn.dataset.receipt, bookings, payments)));
    } catch (error) {
      list.innerHTML = `<p class="auth-message">${escapeHtml(error.message)}</p>`;
    }
  }

  function downloadReceipt(ref, bookings, payments) {
    const booking = bookings.find(b => b.booking_ref === ref);
    if (!booking) return;
    const payment = payments.find(p => p.booking?.booking_ref === ref);
    const html = `<!doctype html><meta charset="utf-8"><title>Receipt ${booking.booking_ref}</title><body style="font-family:Georgia,serif;padding:40px;color:#2A2430"><h1>Solo Soul Experiences</h1><h2>Receipt</h2><p>${booking.event_name}<br>${booking.event_date}<br>${booking.guests} guest(s)</p><p><strong>R${Number(booking.total).toFixed(2)}</strong></p><p>Reference: ${booking.booking_ref}<br>Payment: ${payment ? payment.status : booking.status}</p><p>SSoulZAR@outlook.com · ssoul.co.za</p></body>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `receipt-${booking.booking_ref}.html`; a.click();
    URL.revokeObjectURL(a.href);
  }

  function openRefund(ref) {
    activeRefund = ref;
    $('refund-booking-label').textContent = 'Booking ' + ref;
    $('refund-reason').value = '';
    $('refund-dialog').hidden = false;
  }
  function closeRefund() { $('refund-dialog').hidden = true; activeRefund = null; }

  async function submitRefund() {
    const reason = $('refund-reason').value.trim();
    if (!reason) { $('refund-reason').focus(); return; }
    try {
      await api('request-refund', { ref: activeRefund, reason });
      closeRefund();
      loadBookings();
      loadSupport();
    } catch (error) { alert(error.message); }
  }

  async function cancelBooking(ref) {
    if (!confirm('Cancel booking ' + ref + '?')) return;
    try {
      const result = await api('cancel-booking', { ref });
      alert(result.refund_review ? 'Booking cancelled. A refund review ticket was opened.' : 'Booking cancelled.');
      loadBookings();
    } catch (error) { alert(error.message); }
  }

  async function loadSupport() {
    const list = $('support-list');
    $('support-thread').innerHTML = '';
    list.innerHTML = '<p class="auth-note">Loading support…</p>';
    try {
      const data = await api('my-bookings');
      const tickets = data.support || [];
      if (!tickets.length) {
        list.innerHTML = '<div class="booking-card"><div><h3>No support tickets</h3><p class="booking-meta">Need help with a booking or payment? Open a ticket.</p></div><a class="btn btn-primary" href="help.html">Get help</a></div>';
        return;
      }
      list.innerHTML = tickets.map(t => `<div class="support-row"><div><h3>${escapeHtml(t.subject)}</h3><div class="booking-meta">${escapeHtml(t.category)} · ${t.booking_ref ? escapeHtml(t.booking_ref) + ' · ' : ''}${new Date(t.created_at).toLocaleDateString('en-ZA')}</div><div style="margin-top:6px">${badge(t.status)}</div></div><button class="btn btn-secondary" data-thread="${t.id}">Open</button></div>`).join('');
      list.querySelectorAll('[data-thread]').forEach(btn => btn.addEventListener('click', () => openThread(btn.dataset.thread)));
    } catch (error) { list.innerHTML = `<p class="auth-message">${escapeHtml(error.message)}</p>`; }
  }

  async function openThread(id) {
    activeSupport = id;
    try {
      const data = await api('support/get', { id });
      const t = data.ticket;
      $('support-thread').innerHTML = `<div class="account-card" style="margin-top:16px"><h2>${escapeHtml(t.subject)}</h2><p class="booking-meta">${escapeHtml(t.status)} · ${escapeHtml(t.category)}</p><div class="stack" style="margin:16px 0">${(data.messages || []).map(m => `<div class="booking-card"><div><strong>${escapeHtml(m.author_name || m.author_type)}</strong><div class="booking-meta">${escapeHtml(m.message)}</div></div><span class="badge">${m.author_type}</span></div>`).join('')}</div><label>Reply<textarea id="thread-reply" rows="3" placeholder="Add a reply..."></textarea></label><button class="btn btn-primary" id="thread-send" style="margin-top:10px">Send reply</button></div>`;
      $('thread-send').addEventListener('click', async () => {
        const message = $('thread-reply').value.trim();
        if (!message) return;
        await api('support/reply', { id, message });
        openThread(id);
      });
    } catch (error) { alert(error.message); }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  boot();
})();
