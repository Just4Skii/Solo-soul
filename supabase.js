/* ============================================================
   SOLO SOUL EXPERIENCES — Supabase Client Configuration
   ============================================================ */

// Runtime configuration comes from the server so no keys are baked into the bundle.
// Falls back to local-only mode when the API is unavailable.
let supabaseClient = null;
let configPromise = null;

async function getRuntimeConfig() {
  if (window.SOLO_CONFIG) return window.SOLO_CONFIG;
  if (configPromise) return configPromise;

  configPromise = (async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch('/api/public-config', { signal: controller.signal, headers: { Accept: 'application/json' } });
      clearTimeout(timer);
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  })();

  return configPromise;
}

async function ensureSupabase() {
  if (supabaseClient) return supabaseClient;
  const cfg = await getRuntimeConfig();
  window.SOLO_CONFIG = cfg;
  if (cfg.supabaseUrl && cfg.supabaseAnonKey && typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  }
  return supabaseClient;
}

ensureSupabase();

// ============================================================
// DATABASE OPERATIONS - Events
// ============================================================
async function fetchEvents() {
  const client = await ensureSupabase();
  if (!client) return getLocalEvents();

  try {
    const { data, error } = await client
      .from('events')
      .select('*')
      .eq('active', true)
      .order('date', { ascending: true });

    if (error) {
      return getLocalEvents();
    }
    return data || [];
  } catch {
    return getLocalEvents();
  }
}

function getLocalEvents() {
  return typeof soloEvents !== 'undefined' ? soloEvents : [];
}

async function reserveSpots(eventId, guests) {
  if (!supabaseClient) return false;
  try {
    const { data: event, error: fetchError } = await supabaseClient
      .from('events')
      .select('spots_left, spots_total')
      .eq('id', eventId)
      .single();

    return !(fetchError || !event || event.spots_left < guests);
  } catch {
    return false;
  }
}

// ============================================================
// DATABASE OPERATIONS - Bookings (Server-Side API Only)
// ============================================================
async function createBooking(bookingData) {
  // All database booking mutations must go through server-side /api/app or /api/paystack/initialize
  if (bookingData && bookingData.eventId && Number(bookingData.total || 0) === 0) {
    try {
      const res = await fetch('/api/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-free',
          eventId: bookingData.eventId,
          name: bookingData.customerName || bookingData.userEmail,
          email: bookingData.userEmail,
          guests: bookingData.guests || 1,
          notes: bookingData.notes || '',
        }),
      });
      const data = await res.json();
      if (res.ok && data.booking) return data.booking;
    } catch (err) {
      console.error('Server booking creation error:', err);
    }
  }
  return createLocalBooking(bookingData);
}

function createLocalBooking(bookingData) {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  bookings.push({
    id: bookingData.bookingRef,
    userEmail: bookingData.userEmail,
    experience: bookingData.experience,
    date: bookingData.date,
    guests: bookingData.guests,
    total: bookingData.total,
    price: bookingData.price,
    location: bookingData.location,
    status: bookingData.status,
    notes: bookingData.notes,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('bookings', JSON.stringify(bookings));
  return bookings[bookings.length - 1];
}

async function getUserBookings(userEmail) {
  if (!supabaseClient || !userEmail) {
    return JSON.parse(localStorage.getItem('bookings') || '[]')
      .filter(b => b.userEmail === userEmail);
  }

  try {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (token) {
      const res = await fetch('/api/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'my-bookings' }),
      });
      const payload = await res.json();
      if (res.ok && Array.isArray(payload.bookings)) return payload.bookings;
    }
    return [];
  } catch (err) {
    console.error('Get user bookings error:', err);
    return [];
  }
}

// ============================================================
// DATABASE OPERATIONS - Users
// ============================================================
async function authenticateUser(email, password) {
  if (!supabaseClient) return authenticateLocal(email, password);

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error || !data.user) {
      return null;
    }

    const { data: profile } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      await supabaseClient.from('users').insert({
        id: data.user.id,
        email: String(data.user.email || email).toLowerCase(),
        name: data.user.user_metadata?.name || email.split('@')[0],
        phone: data.user.user_metadata?.phone || ''
      });
    }

    return {
      id: data.user.id,
      email: data.user.email || email,
      name: profile?.name || data.user.user_metadata?.name || email.split('@')[0],
      phone: profile?.phone || ''
    };
  } catch (err) {
    console.error('Auth error:', err);
    return authenticateLocal(email, password);
  }
}

function authenticateLocal(email, password) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.find(u => u.email === email && u.password === password) || null;
}

async function registerUser(userData) {
  if (!supabaseClient) return registerLocal(userData);

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone
        }
      }
    });

    if (error) {
      throw error;
    }

    return {
      id: data.user?.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone
    };
  } catch (err) {
    console.error('Registration error:', err);
    return registerLocal(userData);
  }
}

function registerLocal(userData) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.some(u => u.email === userData.email)) {
    throw new Error('Email already registered');
  }
  users.push({
    id: Date.now().toString(),
    ...userData
  });
  localStorage.setItem('users', JSON.stringify(users));
  return userData;
}

// ============================================================
// EXPORTS
// ============================================================
window.SupabaseService = {
  fetchEvents,
  reserveSpots,
  createBooking,
  getUserBookings,
  authenticateUser,
  registerUser,
  get supabase() { return supabaseClient; }
};
