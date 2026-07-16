/* ============================================================
   SOLO SOUL EXPERIENCES — Supabase Client Configuration
   ============================================================ */

// Supabase client initialization
// Uses window.supabase from CDN (loaded in HTML) or creates fallback

const CONFIG = {
  SUPABASE_URL: 'https://iinvfedcrkibnftzbrlz.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbnZmZWRjcmtpYm5mdHpicmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTI2NTIsImV4cCI6MjA5OTc4ODY1Mn0.dehmtRjK-eXWgIVB9DxVmwU_gfpdzY6BSfP-zU5FUes'
};

// Initialize Supabase client
let supabaseClient = null;

function initSupabase() {
  if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  } else {
    console.warn('Supabase library not loaded. Booking features will use localStorage fallback.');
  }
}

// Run immediately
initSupabase();

// ============================================================
// DATABASE OPERATIONS - Events
// ============================================================
async function fetchEvents() {
  if (!supabaseClient) return getLocalEvents();

  try {
    const { data, error } = await supabaseClient
      .from('events')
      .select('*')
      .eq('active', true)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return getLocalEvents();
    }
    return data || [];
  } catch (err) {
    console.error('Fetch events error:', err);
    return getLocalEvents();
  }
}

// Fallback to local events
function getLocalEvents() {
  // Return hardcoded events as fallback (same as current soloEvents)
  return typeof soloEvents !== 'undefined' ? soloEvents : [];
}

// Reserve spots for 10 minutes (prevents race conditions)
async function reserveSpots(eventId, guests, userId) {
  if (!supabaseClient || !userId) return false;

  try {
    // Check if spots are available
    const { data: event, error: fetchError } = await supabaseClient
      .from('events')
      .select('spots_left, spots_total')
      .eq('id', eventId)
      .single();

    if (fetchError || !event || event.spots_left < guests) {
      return false;
    }

    // Create reservation that expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();

    const { error: insertError } = await supabaseClient
      .from('booking_reservations')
      .insert({
        user_id: userId,
        event_id: eventId,
        guests: guests,
        expires_at: expiresAt
      });

    if (insertError) {
      console.error('Reservation error:', insertError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Reserve spots error:', err);
    return false;
  }
}

// ============================================================
// DATABASE OPERATIONS - Bookings
// ============================================================
async function createBooking(bookingData) {
  if (!supabaseClient) return createLocalBooking(bookingData);

  try {
    const { data, error } = await supabaseClient
      .from('bookings')
      .insert({
        booking_ref: bookingData.bookingRef,
        user_id: bookingData.userId,
        user_email: bookingData.userEmail,
        event_id: bookingData.eventId,
        event_name: bookingData.experience,
        event_date: bookingData.date,
        event_location: bookingData.location,
        guests: bookingData.guests,
        total: bookingData.total,
        price_per_guest: bookingData.price,
        status: bookingData.status,
        notes: bookingData.notes,
        payment_intent_id: bookingData.paymentIntentId || null
      })
      .select()
      .single();

    if (error) {
      console.error('Booking creation error:', error);
      return createLocalBooking(bookingData);
    }

    return data;
  } catch (err) {
    console.error('Create booking error:', err);
    return createLocalBooking(bookingData);
  }
}

// Fallback to localStorage
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

// Get user bookings
async function getUserBookings(userEmail) {
  if (!supabaseClient || !userEmail) {
    return JSON.parse(localStorage.getItem('bookings') || '[]')
      .filter(b => b.userEmail === userEmail);
  }

  try {
    const { data, error } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
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

    // Get or create user profile
    const { data: profile } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      // Create profile if doesn't exist
      await supabaseClient.from('users').insert({
        id: data.user.id,
        email: email,
        name: data.user.user_metadata?.name || email.split('@')[0],
        phone: data.user.user_metadata?.phone || ''
      });
    }

    return {
      id: data.user.id,
      email: email,
      name: profile?.name || data.user.user_metadata?.name || email.split('@')[0],
      phone: profile?.phone || ''
    };
  } catch (err) {
    console.error('Auth error:', err);
    return authenticateLocal(email, password);
  }
}

// Fallback to localStorage auth
function authenticateLocal(email, password) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.find(u => u.email === email && u.password === password) || null;
}

// Register user
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
    // Fallback to local if Supabase fails
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