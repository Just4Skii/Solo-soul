/**
 * Paystack webhook.
 * Verifies the x-paystack-signature HMAC SHA-512 before confirming a booking,
 * then checks the reference, currency and amount against the stored booking.
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (!SECRET) return res.status(503).json({ error: 'Paystack is not configured' });

  const signature = req.headers['x-paystack-signature'];
  if (!signature) return res.status(401).json({ error: 'Missing signature' });

  const raw = JSON.stringify(req.body || {});
  const expected = crypto.createHmac('sha512', SECRET).update(raw).digest('hex');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body?.event;
  const data = req.body?.data;
  if (event !== 'charge.success' || !data) return res.status(200).json({ received: true });

  try {
    const bookingRef = data.reference || data.metadata?.booking_ref;
    if (!bookingRef) return res.status(200).json({ received: true });

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, booking_ref, total, status')
      .eq('booking_ref', bookingRef)
      .single();
    if (error || !booking) return res.status(200).json({ received: true });
    if (booking.status === 'Paid') return res.status(200).json({ received: true, idempotent: true });

    if (String(data.currency || '').toUpperCase() !== 'ZAR') return res.status(400).json({ error: 'Currency mismatch' });
    const paid = Number(data.amount) / 100;
    if (!Number.isFinite(paid) || Math.abs(paid - Number(booking.total)) > 0.01) {
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'Paid', payment_intent_id: String(data.id || '') })
      .eq('id', booking.id)
      .eq('status', 'Pending');
    if (updateError) return res.status(500).json({ error: 'Failed to confirm booking' });

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return res.status(500).json({ error: 'Webhook failed' });
  }
}
