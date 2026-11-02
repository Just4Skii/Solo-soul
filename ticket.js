/* Public ticket viewer */
(() => {
  let session = null;
  const ref = new URLSearchParams(window.location.search).get('ref') || '';
  const $ = id => document.getElementById(id);

  async function init() {
    if (!ref) { $('ticket-message').textContent = 'No booking reference supplied.'; return; }
    const cfg = await fetch('/api/public-config').then(r => r.json()).catch(() => ({}));
    if (cfg.supabaseUrl && window.supabase) {
      const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      const { data } = await sb.auth.getSession();
      session = data.session;
      if (session) { $('ticket-email').value = session.user.email || ''; $('ticket-gate').hidden = true; fetchTicket(session.user.email); }
    }
    $('ticket-unlock').addEventListener('click', () => {
      const email = $('ticket-email').value.trim();
      if (!email) return ($('ticket-message').textContent = 'Enter your email.');
      fetchTicket(email);
    });
  }

  async function fetchTicket(email) {
    const headers = { 'Content-Type': 'application/json' };
    if (session) headers.Authorization = 'Bearer ' + session.access_token;
    try {
      const res = await fetch('/api/app', { method: 'POST', headers, body: JSON.stringify({ action: 'booking', ref, email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ticket not found');
      render(data.booking);
    } catch (error) { $('ticket-message').textContent = error.message; }
  }

  function render(b) {
    document.title = 'Ticket ' + b.booking_ref + ' | Solo Soul Experiences';
    $('ticket-gate').hidden = true;
    $('ticket-card').hidden = false;
    $('ticket-event').textContent = b.event_name;
    $('ticket-date').textContent = b.event_date;
    $('ticket-venue').textContent = b.event_location;
    $('ticket-guests').textContent = b.guests + (b.guests > 1 ? ' guests' : ' guest');
    $('ticket-ref').textContent = b.booking_ref;
    $('ticket-code').textContent = b.ticket_code || '—';
    $('ticket-status').textContent = b.status;
    const qr = $('ticket-qr');
    qr.innerHTML = '';
    if (window.QRCode) new QRCode(qr, { text: JSON.stringify({ ref: b.booking_ref, code: b.ticket_code }), width: 160, height: 160, colorDark: '#0B3C49', colorLight: '#F8EFE4' });
  }

  init();
})();
