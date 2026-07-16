/* ══════════════════════════════════════════════════════
   Solo Soul Experiences — Admin Panel Logic v2.2.0
   ══════════════════════════════════════════════════════ */

const API = {
  auth: '/api/admin/auth',
  events: '/api/admin/events',
  bookings: '/api/admin/bookings',
  stats: '/api/admin/stats',
  upload: '/api/admin/upload',
  tickets: '/api/tickets',
};

let adminToken = localStorage.getItem('adminToken');
let adminUser = null;

// ── Utilities ──────────────────────────────────────────
const $ = id => document.getElementById(id);
const show = el => el.style.display = '';
const hide = el => el.style.display = 'none';

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
          case 'events': loadEvents(); break;
          case 'bookings': loadBookings(); break;
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
      ? topExperiences.map(e => `<li><span>${e.name}</span><span class="count">${e.bookings_count} bookings</span></li>`).join('')
      : '<li style="color:var(--text-muted)">No bookings yet</li>';

    // Recent bookings
    const recent = $('recent-bookings');
    recent.innerHTML = recentBookings?.length
      ? recentBookings.slice(0, 5).map(b =>
          `<div class="recent-item">
            <span><strong>${b.booking_ref}</strong> — ${b.event_name} (${b.guests} guests)</span>
            <span class="status-badge ${(b.status || '').toLowerCase()}">${b.status}</span>
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
  const max = Math.max(...monthly.map(m => m.count), 1);
  container.innerHTML = monthly.map(m => {
    const h = Math.max(4, (m.count / max) * 120);
    return `<div class="chart-bar" style="height:${h}px;">
      <span class="bar-value">${m.count}</span>
      <span class="bar-label">${m.month}</span>
    </div>`;
  }).join('');
}

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
        <td><strong>${e.event_name}</strong></td>
        <td>${formatDate(e.date)}</td>
        <td>${e.location}</td>
        <td>${e.is_free ? 'FREE' : (e.price || '-')}</td>
        <td>${e.spots_left || 0}/${e.spots_total || 0}</td>
        <td><span class="status-badge ${e.active ? 'active' : 'inactive'}">${e.category || '-'}</span></td>
        <td><span class="status-badge ${e.active ? 'active' : 'inactive'}">${e.active ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="btn-sm btn-edit" onclick="editEvent('${e.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn-sm btn-delete" onclick="deleteEvent('${e.id}')"><i class="fas fa-trash"></i></button>
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

  // Scroll to form
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
      <td><strong>${b.booking_ref || '-'}</strong></td>
      <td>${b.user_email}</td>
      <td>${b.event_name}</td>
      <td>${formatDate(b.event_date)}</td>
      <td>${b.guests}</td>
      <td>R${parseFloat(b.total || 0).toLocaleString()}</td>
      <td><span class="status-badge ${(b.status || '').toLowerCase()}">${b.status}</span></td>
      <td>
        <select onchange="updateBookingStatus('${b.id}', this.value)" class="status-select">
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
  // Login
  $('login-form').addEventListener('submit', handleLogin);
  $('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') $('login-form').dispatchEvent(new Event('submit')); });

  // Logout
  $('logout-btn').addEventListener('click', handleLogout);

  // Navigation
  initNavigation();

  // Events
  $('add-event-btn').addEventListener('click', () => showEventForm(null));
  $('event-cancel-btn').addEventListener('click', hideEventForm);
  $('event-form').addEventListener('submit', handleEventFormSubmit);
  $('events-search').addEventListener('input', loadEvents);
  $('show-inactive').addEventListener('change', loadEvents);

  // Image upload
  $('ef-image-upload').addEventListener('change', e => {
    if (e.target.files[0]) handleImageUpload(e.target.files[0]);
  });

  // Bookings
  $('bookings-search').addEventListener('input', loadBookings);
  $('bookings-filter').addEventListener('change', loadBookings);

  // Init auth state
  verifySession();
});