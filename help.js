/* Help centre */
(() => {
  let session = null;
  const $ = id => document.getElementById(id);

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function init() {
    const cfg = await fetch('/api/public-config').then(r => r.json()).catch(() => ({}));
    if (cfg.supabaseUrl && window.supabase) {
      const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      const { data } = await sb.auth.getSession();
      session = data.session;
      if (session) {
        $('help-email').value = session.user.email || '';
        $('help-name').value = session.user.user_metadata?.full_name || '';
      }
    }
    $('help-search').addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('#help-faq details').forEach(d => {
        const text = (d.textContent + ' ' + (d.dataset.tags || '')).toLowerCase();
        d.hidden = q && !text.includes(q);
      });
    });
    $('help-form').addEventListener('submit', submit);
  }

  async function submit(e) {
    e.preventDefault();
    const status = $('help-status');
    status.textContent = 'Sending…';
    const body = {
      action: 'support/create',
      name: $('help-name').value.trim(),
      email: $('help-email').value.trim(),
      booking_ref: $('help-ref').value.trim() || null,
      category: $('help-category').value,
      subject: $('help-category').value + ' help — ' + ($('help-ref').value.trim() || $('help-name').value.trim()),
      message: $('help-message').value.trim(),
    };
    const headers = { 'Content-Type': 'application/json' };
    if (session) headers.Authorization = 'Bearer ' + session.access_token;
    try {
      const res = await fetch('/api/app', { method: 'POST', headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send');
      const shortId = escapeHtml(String(data.ticket?.id || '').slice(0, 8));
      status.innerHTML = 'Ticket created — reference <strong>' + shortId + '</strong>. We reply within one business day. <a href="account.html">Track it in My Solo Soul</a>.';
      $('help-form').reset();
    } catch (error) {
      status.textContent = error.message;
    }
  }

  init();
})();
