/**
 * Admin revenue analytics.
 * Revenue is only recognised on Paid bookings; Free bookings count toward seats,
 * while Pending/Refunded are reported separately. Fees are an explicit estimate.
 */
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ADMIN_SECRET || '';
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

const FEE_PERCENT = Number(process.env.PAYSTACK_FEE_PERCENT || 2.9);
const FEE_FIXED = Number(process.env.PAYSTACK_FEE_FIXED || 1);

function requireAdmin(req, res) {
  if (!JWT_SECRET) { res.status(500).json({ error: 'Admin authentication is not configured' }); return null; }
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET, { algorithms: ['HS256'] });
    if (!decoded || !['admin', 'superadmin'].includes(decoded.role)) {
      res.status(403).json({ error: 'Admin role required' });
      return null;
    }
    return decoded;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
}

const money = (n) => Math.round((Number(n) || 0) * 100) / 100;
const feeFor = (gross, count) => money(gross * (FEE_PERCENT / 100) + count * FEE_FIXED);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (!requireAdmin(req, res)) return;

  try {
    const [{ data: bookings, error: bookingsError }, { data: events, error: eventsError }] = await Promise.all([
      supabase.from('bookings').select('id, booking_ref, event_id, event_name, event_date, guests, total, status, created_at'),
      supabase.from('events').select('id, event_name, date, price, spots_total, spots_left, active'),
    ]);
    if (bookingsError) throw bookingsError;
    if (eventsError) throw eventsError;

    const paid = (bookings || []).filter(b => b.status === 'Paid');
    const free = (bookings || []).filter(b => b.status === 'Free');
    const pending = (bookings || []).filter(b => b.status === 'Pending');
    const refunded = (bookings || []).filter(b => b.status === 'Refunded');

    const gross = money(paid.reduce((s, b) => s + Number(b.total || 0), 0));
    const fees = feeFor(gross, paid.length);
    const net = money(gross - fees);
    const seatsPaid = paid.reduce((s, b) => s + Number(b.guests || 0), 0);
    const seatsFree = free.reduce((s, b) => s + Number(b.guests || 0), 0);
    const capacity = (events || []).filter(e => e.active !== false).reduce((s, e) => s + Number(e.spots_total || 0), 0);
    const pendingValue = money(pending.reduce((s, b) => s + Number(b.total || 0), 0));
    const refundedValue = money(refunded.reduce((s, b) => s + Number(b.total || 0), 0));

    const perEvent = (events || []).map(e => {
      const eventBookings = paid.filter(b => b.event_id === e.id);
      const eventGross = money(eventBookings.reduce((s, b) => s + Number(b.total || 0), 0));
      const eventFees = feeFor(eventGross, eventBookings.length);
      const seats = eventBookings.reduce((s, b) => s + Number(b.guests || 0), 0) +
        free.filter(b => b.event_id === e.id).reduce((s, b) => s + Number(b.guests || 0), 0);
      const total = Number(e.spots_total || 0);
      return {
        id: e.id,
        name: e.event_name,
        date: e.date,
        price: e.price,
        spotsTotal: total,
        spotsLeft: Number(e.spots_left ?? total),
        seatsSold: seats,
        occupancy: total ? Math.round((seats / total) * 100) : 0,
        bookings: eventBookings.length,
        gross: eventGross,
        fees: eventFees,
        net: money(eventGross - eventFees),
      };
    }).sort((a, b) => b.gross - a.gross);

    const months = {};
    for (const b of paid) {
      const key = new Date(b.created_at).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });
      months[key] = months[key] || { month: key, gross: 0, bookings: 0, fees: 0 };
      months[key].gross = money(months[key].gross + Number(b.total || 0));
      months[key].bookings += 1;
    }
    const monthly = Object.values(months).map(m => ({ ...m, fees: feeFor(m.gross, m.bookings), net: money(m.gross - feeFor(m.gross, m.bookings)) })).slice(-6);

    return res.status(200).json({
      currency: 'ZAR',
      assumptions: { feePercent: FEE_PERCENT, feeFixed: FEE_FIXED },
      totals: {
        gross,
        fees,
        net,
        paidBookings: paid.length,
        freeBookings: free.length,
        pendingBookings: pending.length,
        refundedBookings: refunded.length,
        seatsSold: seatsPaid + seatsFree,
        seatsPaid,
        seatsFree,
        capacity,
        occupancy: capacity ? Math.round(((seatsPaid + seatsFree) / capacity) * 100) : 0,
        averageOrderValue: paid.length ? money(gross / paid.length) : 0,
        pendingValue,
        refundedValue,
      },
      perEvent,
      monthly,
    });
  } catch (error) {
    console.error('Revenue error:', error);
    return res.status(500).json({ error: 'Failed to calculate revenue' });
  }
}
