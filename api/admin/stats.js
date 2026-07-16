/**
 * Admin Stats Endpoint
 * /api/admin/stats — Dashboard statistics
 * Solo Soul Experiences — 2026-07-16
 *
 * Requires Bearer JWT token. Returns aggregated booking/event stats.
 */

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iinvfedcrkibnftzbrlz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || 'solo-soul-admin-secret-2026';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

function requireAdmin(req, res) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  const decoded = verifyToken(auth.slice(7));
  if (!decoded) { res.status(401).json({ error: 'Invalid or expired token' }); return null; }
  return decoded;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    // ── All active events ─────────────────────────────────
    const { data: events, error: eventsErr } = await supabase
      .from('events')
      .select('id, event_name, spots_total, spots_left, date, price, is_free')
      .eq('active', true);
    if (eventsErr) throw eventsErr;

    // ── All bookings ──────────────────────────────────────
    const { data: bookings, error: bookingsErr } = await supabase
      .from('bookings')
      .select('id, booking_ref, status, total, created_at, event_name, guests');
    if (bookingsErr) throw bookingsErr;

    // ── Aggregate stats ───────────────────────────────────
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const paidBookings = bookings.filter(b => b.status === 'Paid' || b.status === 'Free').length;
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled' || b.status === 'Refunded').length;

    const totalRevenue = bookings
      .filter(b => b.status === 'Paid')
      .reduce((sum, b) => sum + parseFloat(b.total || 0), 0);

    const totalSpots = events.reduce((sum, e) => sum + (e.spots_total || 0), 0);
    const filledSpots = totalSpots - events.reduce((sum, e) => sum + (e.spots_left || 0), 0);

    // ── Monthly booking trend ─────────────────────────────
    const monthlyMap = {};
    bookings.forEach(b => {
      const month = b.created_at ? b.created_at.slice(0, 7) : 'unknown';
      monthlyMap[month] = (monthlyMap[month] || 0) + 1;
    });
    const monthlyBookings = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    // ── Top experiences ───────────────────────────────────
    const expMap = {};
    bookings.forEach(b => {
      const name = b.event_name || 'Unknown';
      expMap[name] = (expMap[name] || 0) + 1;
    });
    const topExperiences = Object.entries(expMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, bookings_count]) => ({ name, bookings_count }));

    return res.json({
      stats: {
        totalEvents: events.length,
        totalBookings,
        pendingBookings,
        paidBookings,
        cancelledBookings,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalSpots,
        filledSpots,
        fillRate: totalSpots > 0 ? Math.round((filledSpots / totalSpots) * 100) : 0,
      },
      monthlyBookings,
      topExperiences,
      recentBookings: bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10),
      events,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: err.message || 'Stats fetch failed' });
  }
}