/* ══════════════════════════════════════════════════════
   Solo Soul Experiences — Admin Panel Logic v2.2.1 (Hardened)
   ══════════════════════════════════════════════════════ */

const API = {
  auth: '/api/admin/auth',
  events: '/api/admin/events',
  blog: '/api/admin/events',
  bookings: '/api/admin/bookings',
  stats: '/api/admin/stats',
  revenue: '/api/admin/stats',
  upload: '/api/admin/upload',
  tickets: '/api/tickets',
};

let adminToken = localStorage.getItem('adminToken');
let adminUser = null;

// ── Utilities ──────────────────────────────────────────
const $ = id => document.getElementById(id);
const show = el => el.style.display = '';
const hide = el => el.style.display = 'none';

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function toast(msg, type = 'info') {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function api(method, url, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
  return fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined }).then(r => r.json());
}

// ── AUTH ────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const btn = $('login-btn');
  const email = $('login-email').value.trim();
  const password = $('login-password').value;
  const errorEl = $('login-error');
  errorEl.textContent = '';

  if (!email || !password) { errorEl.textContent = 'Please enter email and password.'; return; }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

  try {
    const res = await api('POST', API.auth, { action: 'login', email, password });

    if (res.error) {
      errorEl.textContent = res.error;
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-shield-alt"></i> Sign In';
      return;
    }

    adminToken = res.token;
    adminUser = res.admin;
    localStorage.setItem('adminToken', adminToken);
    localStorage.setItem('adminUser', JSON.stringify(adminUser));
    showAdminApp();
    toast('Welcome back, ' + adminUser.name + '!', 'success');
    if (res.mustChangePassword) openPasswordModal(true);
  } catch (err) {
    errorEl.textContent = 'Network error. Check connection.';
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-shield-alt"></i> Sign In';
  }
}

function handleLogout() {
  adminToken = null;
  adminUser = null;
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  showLoginScreen();
  toast('Signed out', 'info');
}

function showLoginScreen() {
  hide($('admin-app'));
  show($('login-screen'));
  $('login-btn').disabled = false;
  $('login-btn').innerHTML = '<i class="fas fa-shield-alt"></i> Sign In';
}

function openPasswordModal(forced) {
  const modal = $('password-modal');
  if (!modal) return;
  modal.dataset.forced = forced ? '1' : '';
  $('password-modal-title').textContent = forced ? 'Set your own password' : 'Change your password';
  $('password-modal-copy').textContent = forced
    ? 'You are signed in with a one time password. Choose a new password now to keep the account secure.'
    : 'Choose a password only you know. Use at least 12 characters.';
  $('password-cancel').textContent = forced ? 'Sign out' : 'Cancel';
  $('password-error').textContent = '';
  $('password-form').reset();
  modal.style.display = 'flex';
  setTimeout(() => $('password-current').focus(), 30);
}

function closePasswordModal() {
  const modal = $('password-modal');
  if (modal) modal.style.display = 'none';
}

async function handlePasswordChange(e) {
  e.preventDefault();
  const currentPassword = $('password-current').value;
  const newPassword = $('password-new').value;
  const confirm = $('password-confirm').value;
  const errorEl = $('password-error');
  errorEl.textContent = '';

  if (newPassword.length < 12) { errorEl.textContent = 'Use at least 12 characters.'; return; }
  if (newPassword !== confirm) { errorEl.textContent = 'The new passwords do not match.'; return; }

  const btn = $('password-save');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  try {
    const res = await api('POST', API.auth, { action: 'change-password', currentPassword, newPassword });
    if (res.error) {
      errorEl.textContent = res.error;
      return;
    }
    closePasswordModal();
    toast('Password changed. Keep it somewhere safe.', 'success');
  } catch {
    errorEl.textContent = 'Network error. Try again.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save new password';
  }
}

function showAdminApp() {
  hide($('login-screen'));
  show($('admin-app'));
  $('admin-name').textContent = adminUser?.name || 'Admin';
  $('admin-role').textContent = adminUser?.role || 'admin';
  $('settings-name').value = adminUser?.name || '';
  $('settings-email').value = adminUser?.email || '';
  $('settings-role').value = adminUser?.role || '';
  loadDashboard();
}

// ── Verify token on load ──────────────────────────────
async function verifySession() {
  if (!adminToken) { showLoginScreen(); return; }
  try {
    const res = await api('POST', API.auth, { action: 'verify' });
    if (res.valid) {
      adminUser = res.admin;
      showAdminApp();
      if (res.mustChangePassword) openPasswordModal(true);
    } else {
      showLoginScreen();
    }
  } catch {
    showLoginScreen();
  }
}

// ── Navigation ─────────────────────────────────────────
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      const section = $('section-' + item.dataset.section);
      if (section) {
        section.classList.add('active');
        switch (item.dataset.section) {
          case 'dashboard': loadDashboard(); break;
          case 'analytics': loadAnalytics(); break;
          case 'events': loadEvents(); break;
          case 'blog': loadBlogPosts(); break;
          case 'bookings': loadBookings(); break;
          case 'revenue': loadRevenue(); break;
          case 'operations': loadOperations(); break;
        }
      }
    });
  });
}

// ══════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════

async function loadDashboard() {
  try {
    const res = await api('POST', API.stats, {});
    if (res.error) { toast(res.error, 'error'); return; }

    const { stats, monthlyBookings, topExperiences, recentBookings } = res;

    $('stat-events').textContent = stats.totalEvents || 0;
    $('stat-bookings').textContent = stats.totalBookings || 0;
    $('stat-revenue').textContent = 'R' + (stats.totalRevenue || 0).toLocaleString();
    $('stat-fillrate').textContent = (stats.fillRate || 0) + '%';
    $('last-updated').textContent = 'Updated: ' + new Date().toLocaleTimeString();

    // Top experiences
    const topList = $('top-experiences');
    topList.innerHTML = topExperiences?.length
      ? topExperiences.map(e => `<li><span>${esc(e.name)}</span><span class="count">${Number(e.bookings_count) || 0} bookings</span></li>`).join('')
      : '<li style="color:var(--text-muted)">No bookings yet</li>';

    // Recent bookings
    const recent = $('recent-bookings');
    recent.innerHTML = recentBookings?.length
      ? recentBookings.slice(0, 5).map(b =>
          `<div class="recent-item">
            <span><strong>${esc(b.booking_ref)}</strong> — ${esc(b.event_name)} (${Number(b.guests) || 1} guests)</span>
            <span class="status-badge ${esc((b.status || '').toLowerCase())}">${esc(b.status)}</span>
          </div>`).join('')
      : '<p style="color:var(--text-muted);font-size:13px;">No recent bookings</p>';

    // Monthly chart
    renderChart(monthlyBookings);
  } catch (err) {
    toast('Failed to load dashboard', 'error');
  }
}

function renderChart(monthly) {
  const container = $('monthly-chart');
  if (!monthly?.length) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No booking data yet</p>';
    return;
  }
  const max = Math.max(...monthly.map(m => Number(m.count) || 0), 1);
  container.innerHTML = monthly.map(m => {
    const count = Number(m.count) || 0;
    const h = Math.max(4, (count / max) * 120);
    return `<div class="chart-bar" style="height:${h}px;">
      <span class="bar-value">${count}</span>
      <span class="bar-label">${esc(m.month)}</span>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════

function analyticsNumber(n) {
  return Number(n || 0).toLocaleString('en-ZA');
}

function analyticsShare(value, total) {
  return total ? Math.max(2, Math.round((Number(value || 0) / total) * 100)) : 0;
}

function renderAnalyticsList(target, items, renderRow, emptyText) {
  const el = $(target);
  if (!el) return;
  el.innerHTML = items?.length
    ? items.map(renderRow).join('')
    : `<p class="analytics-empty">${esc(emptyText)}</p>`;
}

function renderAnalyticsChart(daily) {
  const el = $('analytics-daily-chart');
  if (!el) return;
  const rows = daily || [];
  if (!rows.length) {
    el.innerHTML = '<p class="analytics-empty">No page views in this period yet.</p>';
    return;
  }
  const max = Math.max(...rows.map(d => Number(d.pageviews) || 0), 1);
  el.innerHTML = rows.map(d => {
    const h = Math.max(3, Math.round(((Number(d.pageviews) || 0) / max) * 100));
    return `<div class="analytics-day" title="${esc(d.date)} · ${analyticsNumber(d.pageviews)} views · ${analyticsNumber(d.visitors)} visitors">
      <div class="analytics-bar-track"><span class="analytics-bar" style="height:${h}%"></span></div>
      <small>${esc(String(d.date).slice(8, 10))}</small>
    </div>`;
  }).join('');
}

function renderAnalyticsFunnel(totals) {
  const el = $('analytics-funnel');
  if (!el) return;
  const steps = [
    ['Page views', totals.pageviews],
    ['Experience views', totals.eventViews],
    ['Provider clicks', totals.outboundClicks],
    ['Bookings started', totals.bookingsStarted],
    ['Bookings completed', totals.bookingsCompleted],
  ];
  const max = Math.max(Number(totals.pageviews) || 0, 1);
  el.innerHTML = steps.map(([label, value]) => `
    <div class="analytics-funnel-row">
      <span>${esc(label)}</span>
      <div class="analytics-funnel-track"><span style="width:${analyticsShare(value, max)}%"></span></div>
      <strong>${analyticsNumber(value)}</strong>
    </div>`).join('');
}

async function loadAnalytics() {
  const note = $('analytics-note');
  const range = Number($('analytics-range')?.value) || 30;
  if (note) note.textContent = 'Loading first-party analytics…';

  try {
    const res = await api('POST', API.stats, { action: 'analytics', days: range });
    if (res.error) {
      toast(res.error, 'error');
      if (note) note.textContent = res.error;
      return;
    }

    const totals = res.totals || {};
    $('an-pageviews').textContent = analyticsNumber(totals.pageviews);
    $('an-visitors').textContent = analyticsNumber(totals.visitors);
    $('an-eventviews').textContent = analyticsNumber(totals.eventViews);
    $('an-outbound').textContent = analyticsNumber(totals.outboundClicks);
    $('analytics-range-label').textContent = `· last ${res.days || range} days`;
    if (note) {
      note.textContent = res.notice || `First-party, cookie-free analytics · ${analyticsNumber(res.totals?.registrations)} registrations · ${analyticsNumber(res.totals?.bookingsCompleted)} completed bookings · ${analyticsNumber(res.totals?.conversionRate)}% start-to-complete conversion.`;
    }

    renderAnalyticsChart(res.daily);
    renderAnalyticsFunnel(totals);

    renderAnalyticsList('analytics-sources', res.topSources, item => `
      <div class="analytics-list-row">
        <span>${esc(item.source)}</span>
        <strong>${analyticsNumber(item.events)}</strong>
        <small>${analyticsNumber(item.visitors)} visitors</small>
      </div>`, 'No traffic sources recorded yet.');

    renderAnalyticsList('analytics-devices', res.devices, item => `
      <div class="analytics-list-row">
        <span>${esc(item.device)}</span>
        <strong>${analyticsNumber(item.events)}</strong>
        <small>events</small>
      </div>`, 'No device data yet.');

    $('analytics-pages').innerHTML = res.topPages?.length
      ? res.topPages.map(p => `<tr><td>${esc(p.path || '/')}</td><td>${analyticsNumber(p.views)}</td></tr>`).join('')
      : '<tr><td colspan="2" class="analytics-empty">No page views yet.</td></tr>';

    $('analytics-events').innerHTML = res.topEvents?.length
      ? res.topEvents.map(e => `<tr><td>${esc(e.name)}</td><td>${analyticsNumber(e.views)}</td></tr>`).join('')
      : '<tr><td colspan="2" class="analytics-empty">No experience views yet.</td></tr>';

    $('analytics-providers').innerHTML = res.providers?.length
      ? res.providers.map(p => `<tr><td>${esc(p.provider)}</td><td>${analyticsNumber(p.clicks)}</td></tr>`).join('')
      : '<tr><td colspan="2" class="analytics-empty">No outbound clicks yet.</td></tr>';

    $('analytics-recent').innerHTML = res.recent?.length
      ? res.recent.map(r => `<div class="recent-item">
          <span><strong>${esc(r.type.replace(/_/g, ' '))}</strong> ${r.name ? '· ' + esc(r.name) : r.path ? '· ' + esc(r.path) : ''}</span>
          <span>${esc(r.source || 'direct')} · ${esc(r.device || 'unknown')} · ${esc(formatDate(r.occurredAt))}</span>
        </div>`).join('')
      : '<p class="analytics-empty">No recent activity yet.</p>';
  } catch {
    if (note) note.textContent = 'Could not load analytics. Check the analytics migration and try again.';
    toast('Failed to load analytics', 'error');
  }
}

async function loadRevenue() {
  try {
    const res = await api('POST', API.revenue, { action: 'revenue' });
    if (res.error) { toast(res.error, 'error'); return; }
    const { totals, perEvent, monthly, assumptions } = res;
    const money = n => 'R' + Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    $('rev-gross').textContent = money(totals.gross);
    $('rev-fees').textContent = money(totals.fees);
    $('rev-net').textContent = money(totals.net);
    $('rev-seats').textContent = totals.seatsSold || 0;
    $('rev-occupancy').textContent = (totals.occupancy || 0) + '%';
    $('rev-aov').textContent = money(totals.averageOrderValue);
    $('revenue-updated').textContent = 'Updated: ' + new Date().toLocaleTimeString();
    $('revenue-assumptions').textContent =
      'Estimates use ' + assumptions.feePercent + '% + R' + assumptions.feeFixed +
      ' per paid booking. Revenue counts Paid bookings only; Free bookings count toward seats. Pending and refunded values are shown separately.';

    const tbody = $('revenue-tbody');
    tbody.innerHTML = perEvent?.length ? perEvent.map(e =>
      '<tr><td><strong>' + esc(e.name) + '</strong></td><td>' + esc(formatDate(e.date)) + '</td><td>' + esc(e.price || '-') +
      '</td><td>' + (Number(e.seatsSold) || 0) + '/' + (Number(e.spotsTotal) || 0) + '</td><td>' + (Number(e.occupancy) || 0) + '%</td><td>' + (Number(e.bookings) || 0) +
      '</td><td>' + money(e.gross) + '</td><td>' + money(e.fees) + '</td><td><strong>' + money(e.net) + '</strong></td></tr>'
    ).join('') : '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:26px;">No events yet — add an experience to start tracking revenue.</td></tr>';

    $('revenue-monthly').innerHTML = monthly?.length ? monthly.map(m =>
      '<div class="recent-item"><span><strong>' + esc(m.month) + '</strong> — ' + (Number(m.bookings) || 0) + ' paid bookings</span><span>' + money(m.gross) + ' gross / ' + money(m.net) + ' net</span></div>'
    ).join('') : '<p style="color:var(--text-muted);font-size:13px;">No paid bookings yet.</p>';

    $('revenue-pipeline').innerHTML =
      '<div class="recent-item"><span>Pending bookings</span><span>' + (Number(totals.pendingBookings) || 0) + ' · ' + money(totals.pendingValue) + '</span></div>' +
      '<div class="recent-item"><span>Refunded</span><span>' + (Number(totals.refundedBookings) || 0) + ' · ' + money(totals.refundedValue) + '</span></div>' +
      '<div class="recent-item"><span>Free bookings</span><span>' + (Number(totals.freeBookings) || 0) + ' · ' + (Number(totals.seatsFree) || 0) + ' seats</span></div>';
  } catch (err) {
    toast('Failed to load revenue', 'error');
  }
}

async function loadOperations() {
  try {
    const [refunds, support, payments, settlements, emails, audit] = await Promise.all([
      api('POST', API.bookings, { action: 'refunds' }),
      api('POST', API.bookings, { action: 'support' }),
      api('POST', API.bookings, { action: 'payments' }),
      api('POST', API.bookings, { action: 'settlements' }),
      api('POST', API.bookings, { action: 'emails' }),
      api('POST', API.bookings, { action: 'settlementAudit' }),
    ]);

    $('refunds-tbody').innerHTML = (refunds.refunds || []).length ? refunds.refunds.map(r => `<tr>
      <td><strong>${esc(r.booking?.booking_ref || '-')}</strong><br><span style="font-size:11px;color:var(--text-muted)">${esc(r.booking?.event_name || '')}</span></td>
      <td>${esc(r.booking?.user_email || '-')}</td>
      <td>R${Number(r.amount || 0).toFixed(2)}</td>
      <td style="max-width:260px">${esc(r.reason)}</td>
      <td><span class="status-badge ${esc(r.status)}">${esc(r.status)}</span></td>
      <td>${r.status === 'requested' ? `<button class="btn-primary" onclick="adminRefund('${esc(r.id)}','approve')">Approve</button> <button class="btn-secondary" onclick="adminRefund('${esc(r.id)}','reject')">Reject</button>` : '-'}</td>
    </tr>`).join('') : '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted)">No refund requests.</td></tr>';

    $('support-tbody').innerHTML = (support.tickets || []).length ? support.tickets.map(t => `<tr>
      <td><strong>${esc(t.subject)}</strong><br><span style="font-size:11px;color:var(--text-muted)">${esc(t.booking_ref || '')}</span></td>
      <td>${esc(t.email)}</td><td>${esc(t.category)}</td>
      <td><span class="status-badge ${esc(t.status)}">${esc(t.status)}</span></td>
      <td>${esc(formatDate(t.created_at))}</td>
      <td><button class="btn-secondary" onclick="adminSupportOpen('${esc(t.id)}')">Open</button></td>
    </tr>`).join('') : '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted)">No support tickets.</td></tr>';

    $('payments-tbody').innerHTML = (payments.payments || []).length ? payments.payments.map(p => `<tr>
      <td>${esc(p.provider_reference || '-')}</td><td>${esc(p.booking?.booking_ref || '-')}<br><span style="font-size:11px;color:var(--text-muted)">${esc(p.booking?.event_name || '')}</span></td>
      <td>R${Number(p.amount || 0).toFixed(2)}</td><td><span class="status-badge ${esc(p.status)}">${esc(p.status)}</span></td><td>${p.paid_at ? esc(formatDate(p.paid_at)) : '-'}</td>
    </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted)">No payments yet.</td></tr>';

    $('settlements-tbody').innerHTML = (settlements.settlements || []).length ? settlements.settlements.map(x => `<tr>
      <td>${esc(x.reference || '-')}</td><td>${esc(x.provider_name)}</td><td>R${Number(x.gross || 0).toFixed(2)}</td>
      <td>R${Number(x.platform_fee || 0).toFixed(2)}</td><td>R${Number(x.provider_amount || 0).toFixed(2)}</td>
      <td><span class="status-badge ${esc(x.status)}">${esc(x.status)}</span></td>
      <td>${x.status === 'pending' ? `<button class="btn-secondary" onclick="markSettled('${esc(x.id)}')">Mark paid</button>` : '-'}</td>
    </tr>`).join('') : '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">No settlements yet.</td></tr>';

    $('emails-tbody').innerHTML = (emails.emails || []).length ? emails.emails.map(e => `<tr><td>${esc(e.template)}</td><td>${esc(e.recipient)}</td><td><span class="status-badge ${esc(e.status)}">${esc(e.status)}</span></td><td style="max-width:260px">${esc(e.error || '-')}</td><td>${e.created_at ? esc(formatDate(e.created_at)) : '-'}</td></tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted)">No email attempts yet.</td></tr>';
    const auditBox = $('settlement-audit');
    if (auditBox) auditBox.innerHTML = (audit.audit || []).length ? audit.audit.map(x => `<div class="recent-item"><span><strong>${esc(x.action)}</strong> · ${esc(x.provider || '')} ${x.reference ? '· ' + esc(x.reference) : ''}</span><span>${esc(x.previous_status || '—')} → ${esc(x.new_status || '—')} · R${Number(x.amount || 0).toFixed(2)} · ${esc(x.actor_email || x.actor_id || 'system')}</span></div>`).join('') : '<p style="color:var(--text-muted);font-size:13px">No settlement audit entries yet.</p>';
    $('reconcile-btn').onclick = runReconcile;
    $('social-post-btn').onclick = async () => {
      const box = $('social-result'); box.innerHTML = '<p style="font-size:13px">Posting…</p>';
      const res = await api('POST', API.bookings, { action: 'postSocial' });
      const r = res.result || res;
      box.innerHTML = '<div class="recent-item"><span>' + esc(r.error || r.skipped || ('Posted: ' + (r.event || ''))) + '</span><span>' + esc(r.post_id || '') + '</span></div>';
    };
    $('ops-refresh').onclick = loadOperations;
  } catch (e) { toast('Failed to load operations', 'error'); }
}

window.runReconcile = async function() {
  const box = $('reconcile-result');
  box.innerHTML = '<p style="font-size:13px">Checking Paystack…</p>';
  const res = await api('POST', API.bookings, { action: 'reconcile' });
  if (res.error) { box.innerHTML = '<p class="auth-message">' + esc(res.error) + '</p>'; return; }
  box.innerHTML = `<div class="recent-item"><span>Paystack transactions</span><span>${Number(res.summary.paystackTransactions) || 0}</span></div>` +
    `<div class="recent-item"><span>Internal payments</span><span>${Number(res.summary.internalPayments) || 0}</span></div>` +
    `<div class="recent-item"><span>Missing internally</span><span>${Number(res.summary.missingInternal) || 0}</span></div>` +
    `<div class="recent-item"><span>Missing on Paystack</span><span>${Number(res.summary.missingProvider) || 0}</span></div>`;
};

window.adminRefund = async function(id, decision) {
  const note = prompt(decision === 'approve' ? 'Refund note (optional)' : 'Rejection reason (optional)') || '';
  const res = await api('POST', API.bookings, { action: 'refundAction', id, decision, note });
  if (res.error) return toast(res.error, 'error');
  toast(decision === 'approve' ? 'Refund submitted to Paystack' : 'Refund rejected', 'success');
  loadOperations();
};

window.adminSupportOpen = async function(id) {
  const res = await api('POST', API.bookings, { action: 'supportGet', id });
  if (res.error) return toast(res.error, 'error');
  const t = res.ticket;
  $('support-thread').innerHTML = `<div class="card" style="margin-top:14px">
    <h3>${esc(t.subject)}</h3>
    <p style="font-size:12px;color:var(--text-muted)">${esc(t.email)} · ${esc(t.category)} · ${esc(t.status)}</p>
    <div style="margin:14px 0">${(res.messages || []).map(m => `<div style="padding:10px 0;border-bottom:1px solid var(--border)"><strong>${esc(m.author_name || m.author_type)}</strong><div style="font-size:13px;margin-top:4px">${esc(m.message)}</div></div>`).join('')}</div>
    <textarea id="admin-reply" rows="3" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px" placeholder="Reply to customer..."></textarea>
    <div style="margin-top:10px;display:flex;gap:8px">
      <button class="btn-primary" onclick="adminSupportReply('${esc(t.id)}','in_progress')">Send reply</button>
      <button class="btn-secondary" onclick="adminSupportReply('${esc(t.id)}','resolved')">Resolve</button>
    </div>
  </div>`;
};

window.adminSupportReply = async function(id, status) {
  const message = $('admin-reply').value.trim();
  if (!message) return;
  const res = await api('POST', API.bookings, { action: 'supportReply', id, message, status });
  if (res.error) return toast(res.error, 'error');
  toast('Reply sent', 'success');
  adminSupportOpen(id);
  loadOperations();
};

window.markSettled = async function(id) {
  const reason = prompt('Approval note for this settlement (required):');
  if (!reason) return;
  const res = await api('POST', API.bookings, { action: 'settle', id, reason });
  if (res.error) return toast(res.error, 'error');
  toast('Settlement marked paid', 'success');
  loadOperations();
};

// ══════════════════════════════════════════════════════════
// EVENTS
// ══════════════════════════════════════════════════════════

async function loadEvents() {
  const tbody = $('events-tbody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">Loading...</td></tr>';

  try {
    const includeInactive = $('show-inactive').checked;
    const res = await api('POST', API.events, { action: 'list', includeInactive });
    if (res.error) { toast(res.error, 'error'); return; }

    const events = res.events || [];
    if (!events.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">No events found. Click "Add Event" to create one.</td></tr>';
      return;
    }

    tbody.innerHTML = events.map(e => `
      <tr>
        <td><strong>${esc(e.event_name)}</strong></td>
        <td>${esc(formatDate(e.date))}</td>
        <td>${esc(e.location)}</td>
        <td>${e.is_free ? 'FREE' : esc(e.price || '-')}</td>
        <td>${Number(e.spots_left) || 0}/${Number(e.spots_total) || 0}</td>
        <td><span class="status-badge ${e.active ? 'active' : 'inactive'}">${esc(e.category || '-')}</span></td>
        <td><span class="status-badge ${e.active ? 'active' : 'inactive'}">${e.active ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="btn-sm btn-edit" onclick="editEvent('${esc(e.id)}')"><i class="fas fa-edit"></i></button>
          <button class="btn-sm btn-delete" onclick="deleteEvent('${esc(e.id)}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--danger);">Failed to load events</td></tr>';
  }
}

function showEventForm(eventData) {
  const container = $('event-form-container');
  show(container);
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });

  $('event-form-title').textContent = eventData ? 'Edit Event' : 'New Event';
  $('event-id').value = eventData?.id || '';
  $('ef-name').value = eventData?.event_name || '';
  $('ef-date').value = eventData?.date || '';
  $('ef-location').value = eventData?.location || '';
  $('ef-duration').value = eventData?.duration || '';
  $('ef-price').value = eventData?.price || '';
  $('ef-spots').value = eventData?.spots_total || 10;
  $('ef-category').value = eventData?.category || 'mindful';
  $('ef-image').value = eventData?.image_url || '';
  $('ef-description').value = eventData?.description || '';
  $('ef-free').checked = eventData?.is_free || false;
  $('ef-featured').checked = eventData?.is_featured || false;

  setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function hideEventForm() {
  hide($('event-form-container'));
  $('event-form').reset();
  $('event-id').value = '';
  $('event-form-error').textContent = '';
}

async function editEvent(id) {
  try {
    const res = await api('POST', API.events, { action: 'get', id });
    if (res.event) {
      showEventForm(res.event);
    } else {
      toast('Event not found', 'error');
    }
  } catch {
    toast('Failed to load event', 'error');
  }
}

async function deleteEvent(id) {
  if (!confirm('Delete this event? It will be deactivated (soft delete).')) return;
  try {
    const res = await api('POST', API.events, { action: 'delete', id });
    if (res.deleted) {
      toast('Event deleted', 'success');
      loadEvents();
    } else {
      toast(res.error || 'Delete failed', 'error');
    }
  } catch {
    toast('Failed to delete event', 'error');
  }
}

async function handleEventFormSubmit(e) {
  e.preventDefault();
  const id = $('event-id').value;
  const data = {
    event_name: $('ef-name').value.trim(),
    date: $('ef-date').value,
    location: $('ef-location').value.trim(),
    duration: $('ef-duration').value.trim(),
    price: $('ef-price').value.trim(),
    spots_total: parseInt($('ef-spots').value) || 10,
    category: $('ef-category').value,
    image_url: $('ef-image').value.trim(),
    description: $('ef-description').value.trim(),
    is_free: $('ef-free').checked,
    is_featured: $('ef-featured').checked,
  };

  if (!data.event_name || !data.date || !data.location) {
    $('event-form-error').textContent = 'Name, date, and location are required.';
    return;
  }

  $('event-form-error').textContent = '';
  const action = id ? 'update' : 'create';
  if (id) data.id = id;

  try {
    const res = await api('POST', API.events, { action, ...data });
    if (res.event) {
      toast(id ? 'Event updated!' : 'Event created!', 'success');
      hideEventForm();
      loadEvents();
    } else {
      $('event-form-error').textContent = res.error || 'Save failed';
    }
  } catch {
    $('event-form-error').textContent = 'Network error. Try again.';
  }
}

// ══════════════════════════════════════════════════════════
// BLOG
// ══════════════════════════════════════════════════════════

let blogData = [];

function blogPreview(url) {
  const box = $('blog-image-preview');
  if (!box) return;
  const img = box.querySelector('img');
  if (url && img) {
    img.src = url;
    box.hidden = false;
  } else {
    img?.removeAttribute('src');
    box.hidden = true;
  }
}

function showBlogForm(post) {
  const box = $('blog-form-container');
  if (!box) return;
  box.style.display = '';
  $('blog-form-title').textContent = post ? 'Edit Post' : 'New Post';
  $('bf-id').value = post?.id || '';
  $('bf-title').value = post?.title || '';
  $('bf-category').value = post?.category || 'Self Love';
  $('bf-excerpt').value = post?.excerpt || '';
  $('bf-content').value = post?.content || '';
  $('bf-image').value = post?.image_url || '';
  $('bf-image-alt').value = post?.image_alt || '';
  $('bf-read-time').value = post?.read_time || 4;
  $('bf-status').value = post?.status || 'draft';
  $('bf-featured').checked = Boolean(post?.featured);
  $('blog-form-error').textContent = '';
  blogPreview(post?.image_url || '');
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideBlogForm() {
  const box = $('blog-form-container');
  if (box) box.style.display = 'none';
  $('blog-form')?.reset();
  if ($('bf-id')) $('bf-id').value = '';
  blogPreview('');
}

async function loadBlogPosts() {
  const tbody = $('blog-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">Loading...</td></tr>';
  try {
    const res = await api('POST', API.blog, { action: 'blog-list' });
    if (res.error) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--danger);">${esc(res.error)}</td></tr>`;
      return;
    }
    blogData = res.posts || [];
    renderBlogTable();
  } catch {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--danger);">Failed to load posts</td></tr>';
  }
}

function renderBlogTable() {
  const tbody = $('blog-tbody');
  if (!tbody) return;
  const query = ($('blog-search')?.value || '').trim().toLowerCase();
  const posts = blogData.filter(post => !query || `${post.title} ${post.category}`.toLowerCase().includes(query));
  if (!posts.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">No posts yet. Click “New Post” to write one.</td></tr>';
    return;
  }
  tbody.innerHTML = posts.map(post => `
    <tr>
      <td><strong>${esc(post.title)}</strong><br><span style="font-size:11px;color:var(--text-muted)">${esc(post.slug)}</span></td>
      <td>${esc(post.category)}</td>
      <td><span class="status-badge ${post.status === 'published' ? 'active' : 'inactive'}">${post.status === 'published' ? 'Published' : 'Draft'}</span>${post.featured ? ' <span class="status-badge open">Featured</span>' : ''}</td>
      <td>${post.published_at ? esc(formatDate(post.published_at)) : '—'}</td>
      <td>${esc(formatDate(post.updated_at))}</td>
      <td>
        <button class="btn-sm btn-edit" onclick="editBlog('${esc(post.id)}')" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="btn-sm btn-delete" onclick="deleteBlog('${esc(post.id)}')" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

window.editBlog = async function(id) {
  try {
    const res = await api('POST', API.blog, { action: 'blog-get', id });
    if (res.post) showBlogForm(res.post);
    else toast(res.error || 'Post not found', 'error');
  } catch {
    toast('Could not load post', 'error');
  }
};

window.deleteBlog = async function(id) {
  if (!confirm('Delete this blog post? This cannot be undone.')) return;
  const res = await api('POST', API.blog, { action: 'blog-delete', id });
  if (res.error) return toast(res.error, 'error');
  toast('Post deleted', 'success');
  loadBlogPosts();
};

async function handleBlogSubmit(e) {
  e.preventDefault();
  const btn = $('blog-save-btn');
  const errorEl = $('blog-form-error');
  errorEl.textContent = '';
  const title = $('bf-title').value.trim();
  const content = $('bf-content').value.trim();
  if (!title) { errorEl.textContent = 'A title is required.'; return; }
  if (!content) { errorEl.textContent = 'The article is required.'; return; }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  try {
    const res = await api('POST', API.blog, {
      action: 'blog-save',
      id: $('bf-id').value || undefined,
      title,
      category: $('bf-category').value,
      excerpt: $('bf-excerpt').value.trim(),
      content,
      image_url: $('bf-image').value.trim(),
      image_alt: $('bf-image-alt').value.trim(),
      read_time: Number($('bf-read-time').value) || 4,
      status: $('bf-status').value,
      featured: $('bf-featured').checked,
    });
    if (res.error) {
      errorEl.textContent = res.error;
      return;
    }
    toast(res.post?.status === 'published' ? 'Post published' : 'Draft saved', 'success');
    hideBlogForm();
    loadBlogPosts();
  } catch {
    errorEl.textContent = 'Network error. Try again.';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save Post';
  }
}

async function handleBlogImageUpload(file) {
  if (!file) return;
  const formData = new FormData();
  formData.append('image', file);
  try {
    const res = await fetch(API.upload, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    const data = await res.json();
    if (data.url) {
      $('bf-image').value = data.url;
      blogPreview(data.url);
      toast('Cover uploaded', 'success');
    } else {
      toast(data.error || 'Upload failed', 'error');
    }
  } catch {
    toast('Upload failed', 'error');
  }
}

function insertBlogTag(tag) {
  const area = $('bf-content');
  if (!area) return;
  const start = area.selectionStart || 0;
  const end = area.selectionEnd || 0;
  const selected = area.value.slice(start, end);
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const insert = tag === 'a'
    ? `<a href="https://">${selected || 'link text'}</a>`
    : `${open}${selected}${close}`;
  area.setRangeText(insert, start, end, 'end');
  area.focus();
}

// ── Image Upload ──────────────────────────────────────
async function handleImageUpload(file) {
  if (!file) return;
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(API.upload, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    const data = await res.json();
    if (data.url) {
      $('ef-image').value = data.url;
      toast('Image uploaded!', 'success');
    } else {
      toast(data.error || 'Upload failed', 'error');
    }
  } catch {
    toast('Upload failed', 'error');
  }
}

// ══════════════════════════════════════════════════════════
// BOOKINGS
// ══════════════════════════════════════════════════════════

let bookingsData = [];

async function loadBookings() {
  const tbody = $('bookings-tbody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">Loading...</td></tr>';

  try {
    const search = $('bookings-search').value.trim();
    const status = $('bookings-filter').value;
    const res = await api('POST', API.bookings, { action: 'list', search: search || undefined, status: status || undefined });
    if (res.error) { toast(res.error, 'error'); return; }

    bookingsData = res.bookings || [];
    renderBookings();
  } catch {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--danger);">Failed to load bookings</td></tr>';
  }
}

function renderBookings() {
  const tbody = $('bookings-tbody');
  if (!bookingsData.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">No bookings found</td></tr>';
    return;
  }

  tbody.innerHTML = bookingsData.map(b => `
    <tr>
      <td><strong>${esc(b.booking_ref || '-')}</strong></td>
      <td>${esc(b.user_email)}</td>
      <td>${esc(b.event_name)}</td>
      <td>${esc(formatDate(b.event_date))}</td>
      <td>${Number(b.guests) || 1}</td>
      <td>R${parseFloat(b.total || 0).toLocaleString()}</td>
      <td><span class="status-badge ${esc((b.status || '').toLowerCase())}">${esc(b.status)}</span></td>
      <td>
        <select onchange="updateBookingStatus('${esc(b.id)}', this.value)" class="status-select">
          <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Paid" ${b.status === 'Paid' ? 'selected' : ''}>Paid</option>
          <option value="Free" ${b.status === 'Free' ? 'selected' : ''}>Free</option>
          <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          <option value="Refunded" ${b.status === 'Refunded' ? 'selected' : ''}>Refunded</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateBookingStatus(id, status) {
  try {
    const res = await api('POST', API.bookings, { action: 'updateStatus', id, status });
    if (res.booking) {
      toast(`Booking ${status}`, 'success');
      loadBookings();
    } else {
      toast(res.error || 'Update failed', 'error');
    }
  } catch {
    toast('Failed to update booking', 'error');
  }
}

// ══════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  $('login-form').addEventListener('submit', handleLogin);
  $('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') $('login-form').dispatchEvent(new Event('submit')); });

  $('logout-btn').addEventListener('click', handleLogout);

  $('password-form').addEventListener('submit', handlePasswordChange);
  $('change-password-btn').addEventListener('click', () => openPasswordModal(false));
  $('password-cancel').addEventListener('click', () => {
    if ($('password-modal').dataset.forced === '1') {
      closePasswordModal();
      handleLogout();
    } else {
      closePasswordModal();
    }
  });

  initNavigation();

  $('add-event-btn').addEventListener('click', () => showEventForm(null));
  $('event-cancel-btn').addEventListener('click', hideEventForm);
  $('event-form').addEventListener('submit', handleEventFormSubmit);
  $('events-search').addEventListener('input', loadEvents);
  $('show-inactive').addEventListener('change', loadEvents);

  $('ef-image-upload').addEventListener('change', e => {
    if (e.target.files[0]) handleImageUpload(e.target.files[0]);
  });

  $('new-blog-btn').addEventListener('click', () => showBlogForm(null));
  $('blog-cancel-btn').addEventListener('click', hideBlogForm);
  $('blog-form').addEventListener('submit', handleBlogSubmit);
  $('blog-search').addEventListener('input', renderBlogTable);
  $('bf-image').addEventListener('input', e => blogPreview(e.target.value.trim()));
  $('bf-image-upload').addEventListener('change', e => {
    if (e.target.files[0]) handleBlogImageUpload(e.target.files[0]);
  });
  document.querySelectorAll('[data-blog-tag]').forEach(button => {
    button.addEventListener('click', () => insertBlogTag(button.dataset.blogTag));
  });

  $('bookings-search').addEventListener('input', loadBookings);
  $('bookings-filter').addEventListener('change', loadBookings);

  $('analytics-range').addEventListener('change', loadAnalytics);
  $('analytics-refresh').addEventListener('click', loadAnalytics);

  verifySession();
});
