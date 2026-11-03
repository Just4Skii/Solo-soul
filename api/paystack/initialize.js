/**
 * Create a Paystack transaction for a real booking.
 * The amount is derived server-side from the event row — never trusted from the browser.
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { trackServer } from '../../lib/analytics.js';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const checkoutRateLimits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_CHECKOUTS_PER_IP = 10;

function clientIp(req) {
  return String(
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function allowCheckout(req) {
  const ip = clientIp(req);
  const now = Date.now();
  const entry = checkoutRateLimits.get(ip);
  if (!entry || now - entry.start >= WINDOW_MS) {
    checkoutRateLimits.set(ip, { count: 1, start: now });
    return true;
  }
  if (entry.count >= MAX_CHECKOUTS_PER_IP) return false;
  entry.count += 1;
  return true;
}

function reference() {
  return 'SS-' + crypto.randomBytes(5).toString('hex').toUpperCase();
}

function amountFromPrice(price, guests) {
  const raw = String(price || '').replace(/[^\d.]/g, '');
  const unit = Number(raw);
  return Number.isFinite(unit) ? Math.round(unit * guests * 100) / 100 : 0;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (!SECRET) return res.status(503).json({ error: 'Paystack is not configured' });
  if (!allowCheckout(req)) return res.status(429).json({ error: 'Too many checkout requests. Please wait a few minutes.' });

  const { eventId, name, email, phone, guests = 1, notes = '' } = req.body || {};
  if (!eventId || !name || !email) return res.status(400).json({ error: 'eventId, name and email are required' });
  const seats = Math.max(1, Math.min(10, Number(guests) || 1));

  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('id, event_name, date, location, price, is_free, spots_left, active')
      .eq('id', eventId)
      .single();

    if (error || !event) return res.status(404).json({ error: 'Event not found' });
    if (event.active === false) return res.status(400).json({ error: 'Event is not available' });
    if (event.is_free) return res.status(400).json({ error: 'Free events do not need payment' });
    if (Number(event.spots_left) < seats) return res.status(409).json({ error: 'Not enough spots left' });

    const total = amountFromPrice(event.price, seats);
    if (total <= 0) return res.status(400).json({ error: 'Event has no valid price' });

    const bookingRef = reference();
    const safeName = String(name).trim().slice(0, 120);
    const safeEmail = String(email).toLowerCase().trim();
    const { error: insertError } = await supabase.from('bookings').insert({
      booking_ref: bookingRef,
      user_email: safeEmail,
      customer_name: safeName,
      event_id: event.id,
      event_name: event.event_name,
      event_date: event.date,
      event_location: event.location,
      guests: seats,
      total,
      price_per_guest: event.price,
      status: 'Pending',
      notes: String(notes || '').slice(0, 500),
    });
    if (insertError) return res.status(500).json({ error: 'Could not create booking' });

    await trackServer('booking_start', {
      path: '/portal/',
      eventId: event.id,
      eventName: event.event_name,
      source: 'ssoul',
      medium: 'paystack',
      metadata: { booking_ref: bookingRef, guests: seats, total },
    });

    await supabase.from('payments').insert({
      booking_id: null,
      provider: 'paystack',
      provider_reference: bookingRef,
      amount: total,
      currency: 'ZAR',
      status: 'pending',
    });

    // Strict canonical callback URL to prevent Origin header open-redirect
    const canonicalOrigin = (process.env.APP_URL || 'https://ssoul.co.za').replace(/\/$/, '');
    const callback = `${canonicalOrigin}/index.html?payment=success&ref=${encodeURIComponent(bookingRef)}`;

    const { data: bookingRow } = await supabase.from('bookings').select('id').eq('booking_ref', bookingRef).single();
    if (bookingRow) await supabase.from('payments').update({ booking_id: bookingRow.id }).eq('provider_reference', bookingRef);

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: safeEmail,
        amount: Math.round(total * 100),
        currency: 'ZAR',
        reference: bookingRef,
        callback_url: callback,
        metadata: { booking_ref: bookingRef, event_id: event.id, event_name: event.event_name, guests: seats, customer_name: safeName, phone: String(phone || '').slice(0, 30) },
      }),
    });
    const data = await paystackRes.json();
    if (!paystackRes.ok || !data.status) {
      await supabase.from('bookings').update({ status: 'Cancelled' }).eq('booking_ref', bookingRef);
      await supabase.from('payments').update({ status: 'failed' }).eq('provider_reference', bookingRef);
      return res.status(502).json({ error: data.message || 'Paystack initialisation failed' });
    }

    return res.status(200).json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: bookingRef,
      amount: total,
    });
  } catch (error) {
    console.error('Paystack init error:', error);
    return res.status(500).json({ error: 'Checkout could not be started' });
  }
}
