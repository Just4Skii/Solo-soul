/**
 * Admin Stats Endpoint
 * /api/admin/stats — Dashboard statistics
 * Solo Soul Experiences
 *
 * Requires Bearer JWT token. Returns aggregated booking/event stats.
 */

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import revenueHandler from '../../lib/revenue-handler.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function verifyToken(token) {
  if (!JWT_SECRET) return null;
  try { return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }); } catch { return null; }
}

function requireAdmin(req, res) {
  if (!JWT_SECRET) { res.status(500).json({ error: 'Admin authentication is not configured' }); return null; }
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  const decoded = verifyToken(auth.slice(7));
  if (!decoded) { res.status(401).json({ error: 'Invalid or expired token' }); return null; }
  if (!['admin', 'superadmin'].includes(decoded.role)) { res.status(403).json({ error: 'Admin role required' }); return null; }
  return decoded;
}

const ANALYTICS_RANGES = [7, 30, 90];
const analyticsDay = (d) => d.toISOString().slice(0, 10);
const analyticsTop = (map, limit) => [...map.entries()]
  .sort(([, a], [, b]) => b - a)
  .slice(0, limit)
  .map(([name, value]) => ({ name, value }));

async function analyticsHandler(req, res) {
  const requested = Number((req.body || {}).days);
  const days = ANALYTICS_RANGES.includes(requested) ? requested : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_type,path,event_name,event_id,source,medium,device,visitor_id,metadata,occurred_at')
    .gte('occurred_at', since.toISOString())
    .order('occurred_at', { ascending: false })
    .limit(10000);

  if (error) {
    // The analytics migration may not be applied in a fresh environment.
    if (String(error.code) === '42P01') {
      return res.json({
        empty: true,
        days,
        since: since.toISOString(),
        notice: 'Analytics table is not installed yet. Apply migrations/20261103_analytics_events.sql.',
        totals: { pageviews: 0, visitors: 0, eventViews: 0, outboundClicks: 0, bookingsStarted: 0, bookingsCompleted: 0, registrations: 0 },
        topPages: [], topSources: [], topEvents: [], providers: [], devices: [], daily: [], recent: [],
      });
    }
    throw error;
  }

  const rows = data || [];
  const visitors = new Set();
  const pageviews = new Map();
  const sources = new Map();
  const sourceVisitors = new Map();
  const eventViews = new Map();
  const providers = new Map();
  const devices = new Map();
  const daily = new Map();
  const totals = {
    pageviews: 0,
    visitors: 0,
    eventViews: 0,
    outboundClicks: 0,
    registrations: 0,
    bookingsStarted: 0,
    bookingsCompleted: 0,
  };

  for (let i = 0; i < days; i += 1) {
    const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    daily.set(analyticsDay(d), { date: analyticsDay(d), pageviews: 0, visitors: new Set() });
  }

  rows.forEach(row => {
    if (row.visitor_id) visitors.add(row.visitor_id);
    if (row.event_type === 'pageview') {
      totals.pageviews += 1;
      if (row.path) pageviews.set(row.path, (pageviews.get(row.path) || 0) + 1);
    }
    if (row.event_type === 'event_view') {
      totals.eventViews += 1;
      const key = row.event_name || row.path || 'Unknown experience';
      eventViews.set(key, (eventViews.get(key) || 0) + 1);
    }
    if (row.event_type === 'outbound_click') {
      totals.outboundClicks += 1;
      const provider = row.metadata?.provider || row.source || 'unknown';
      providers.set(provider, (providers.get(provider) || 0) + 1);
    }
    if (row.event_type === 'registration') totals.registrations += 1;
    if (row.event_type === 'booking_start') totals.bookingsStarted += 1;
    if (row.event_type === 'booking_completed') totals.bookingsCompleted += 1;

    const sourceKey = `${row.source || 'direct'} / ${row.medium || 'none'}`;
    sources.set(sourceKey, (sources.get(sourceKey) || 0) + 1);
    if (row.visitor_id) {
      if (!sourceVisitors.has(sourceKey)) sourceVisitors.set(sourceKey, new Set());
      sourceVisitors.get(sourceKey).add(row.visitor_id);
    }
    if (row.device) devices.set(row.device, (devices.get(row.device) || 0) + 1);

    const day = String(row.occurred_at || '').slice(0, 10);
    if (daily.has(day)) {
      const bucket = daily.get(day);
      if (row.event_type === 'pageview') bucket.pageviews += 1;
      if (row.visitor_id) bucket.visitors.add(row.visitor_id);
    }
  });

  totals.visitors = visitors.size;
  const dailySeries = [...daily.values()].map(d => ({
    date: d.date,
    pageviews: d.pageviews,
    visitors: d.visitors.size,
  }));
  const completed = totals.bookingsCompleted;
  const started = totals.bookingsStarted;

  return res.json({
    days,
    since: since.toISOString(),
    generatedAt: new Date().toISOString(),
    totals: {
      ...totals,
      conversionRate: started ? Math.round((completed / started) * 100) : 0,
      eventViewRate: totals.pageviews ? Math.round((totals.eventViews / totals.pageviews) * 100) : 0,
      outboundRate: totals.eventViews ? Math.round((totals.outboundClicks / totals.eventViews) * 100) : 0,
    },
    topPages: analyticsTop(pageviews, 10).map(({ name, value }) => ({ path: name, views: value })),
    topSources: analyticsTop(sources, 8).map(({ name, value }) => ({
      source: name,
      events: value,
      visitors: sourceVisitors.get(name)?.size || 0,
    })),
    topEvents: analyticsTop(eventViews, 10).map(({ name, value }) => ({ name, views: value })),
    providers: analyticsTop(providers, 8).map(({ name, value }) => ({ provider: name, clicks: value })),
    devices: analyticsTop(devices, 5).map(({ name, value }) => ({ device: name, events: value })),
    daily: dailySeries,
    recent: rows.filter(r => ['event_view', 'outbound_click', 'booking_completed', 'registration'].includes(r.event_type)).slice(0, 20).map(r => ({
      type: r.event_type,
      path: r.path,
      name: r.event_name,
      source: r.source,
      device: r.device,
      occurredAt: r.occurred_at,
    })),
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const allowedOrigin = process.env.APP_ORIGIN || 'https://ssoul.co.za';
  if (req.headers.origin && req.headers.origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const action = (req.body || {}).action;
  if (action === 'revenue') return revenueHandler(req, res);

  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    if (action === 'analytics') return await analyticsHandler(req, res);
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
    return res.status(500).json({ error: 'Stats fetch failed' });
  }
}
