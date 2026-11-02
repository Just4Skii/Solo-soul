/**
 * Create a Paystack transaction for a real booking.
 * The amount is derived server-side from the event row — never trusted from the browser.
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const SECRET = process.env.PAYSTACK_SECRET_KEY || '';

function reference() {
  return 'SS-' + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(1000 + Math.random() * 9000);
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
    const { error: insertError } = await supabase.from('bookings').insert({
      booking_ref: bookingRef,
      user_email: String(email).toLowerCase().trim(),
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

    const origin = process.env.APP_URL || (req.headers.origin && /^https?:\/\//.test(req.headers.origin) ? req.headers.origin : '');
    const callback = origin ? `${origin.replace(/\/$/, '')}/index.html?payment=success&ref=${encodeURIComponent(bookingRef)}` : undefined;

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: String(email).toLowerCase().trim(),
        amount: Math.round(total * 100),
        currency: 'ZAR',
        reference: bookingRef,
        callback_url: callback,
        metadata: { booking_ref: bookingRef, event_id: event.id, event_name: event.event_name, guests: seats, customer_name: name, phone },
      }),
    });
    const data = await paystackRes.json();
    if (!paystackRes.ok || !data.status) {
      await supabase.from('bookings').update({ status: 'Cancelled' }).eq('booking_ref', bookingRef);
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
