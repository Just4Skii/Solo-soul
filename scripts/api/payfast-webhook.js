/**
 * PayFast ITN (Instant Transaction Notification) webhook.
 * Verifies the PayFast signature, merchant identity and amount before
 * marking a booking paid. Configure the ITN URL in the PayFast dashboard.
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const PASS_PHRASE = process.env.PAYFAST_PASSPHRASE || '';
const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

function encode(value) {
  return encodeURIComponent(String(value).trim()).replace(/%20/g, '+').replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function expectedSignature(data) {
  const pairs = Object.keys(data)
    .filter(key => key !== 'signature' && data[key] !== '' && data[key] !== undefined && data[key] !== null)
    .sort()
    .map(key => `${key}=${encode(data[key])}`);
  const base = pairs.join('&') + (PASS_PHRASE ? `&passphrase=${encode(PASS_PHRASE)}` : '');
  return crypto.createHash('md5').update(base).digest('hex');
}

function signatureValid(data) {
  if (!PASS_PHRASE || !data.signature) return false;
  const expected = expectedSignature(data);
  const supplied = String(data.signature).toLowerCase();
  if (expected.length !== supplied.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!PASS_PHRASE || !MERCHANT_ID) {
    return res.status(503).json({ error: 'PayFast is not configured' });
  }

  try {
    const data = req.body || {};
    if (!signatureValid(data)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    if (String(data.merchant_id || '') !== String(MERCHANT_ID)) {
      return res.status(400).json({ error: 'Merchant mismatch' });
    }

    const reference = data.custom_str2 || data.m_payment_id;
    if (!reference) return res.status(400).json({ error: 'Missing booking reference' });

    const { data: booking, error: lookupError } = await supabase
      .from('bookings')
      .select('id, booking_ref, total, status')
      .eq('booking_ref', reference)
      .single();

    if (lookupError || !booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'Paid') return res.status(200).json({ received: true, idempotent: true });

    const paid = Number(data.amount_gross);
    const expectedAmount = Number(booking.total);
    if (!Number.isFinite(paid) || Math.abs(paid - expectedAmount) > 0.01) {
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    if (data.payment_status === 'COMPLETE') {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Paid', payment_intent_id: data.pf_payment_id || null })
        .eq('id', booking.id)
        .eq('status', 'Pending');

      if (error) return res.status(500).json({ error: 'Failed to update booking' });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('PayFast webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
