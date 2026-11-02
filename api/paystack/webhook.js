/**
 * Paystack webhook — confirms bookings, records payments/settlements,
 * delivers tickets/receipts and completes refunds.
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, ticketEmail, receiptEmail } from '../../lib/email.js';

const SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || 10);

function json(res, status, payload) { res.status(status).json(payload); }
function code() { return crypto.randomBytes(8).toString('hex'); }
function appUrl() { return (process.env.APP_URL || 'https://ssoul.co.za').replace(/\/$/, ''); }

async function confirmBooking(res, data) {
  const reference = data.reference || data.metadata?.booking_ref;
  if (!reference) return json(res, 200, { received: true });

  const { data: booking, error } = await supabase.from('bookings').select('*').eq('booking_ref', reference).single();
  if (error || !booking) return json(res, 200, { received: true });
  if (booking.status === 'Paid') {
    const { data: existing } = await supabase.from('payments').select('id').eq('provider_reference', reference).maybeSingle();
    if (!existing) {
      await supabase.from('payments').insert({ booking_id: booking.id, provider: 'paystack', provider_reference: reference, amount: Number(booking.total), currency: 'ZAR', status: 'paid', raw: data, paid_at: new Date().toISOString() });
    }
    return json(res, 200, { received: true, idempotent: true });
  }

  if (String(data.currency || '').toUpperCase() !== 'ZAR') return json(res, 400, { error: 'Currency mismatch' });
  const paid = Number(data.amount) / 100;
  if (!Number.isFinite(paid) || Math.abs(paid - Number(booking.total)) > 0.01) return json(res, 400, { error: 'Amount mismatch' });

  const ticket = booking.ticket_code || code();
  const { error: updateError } = await supabase.from('bookings').update({
    status: 'Paid',
    payment_intent_id: String(data.id || ''),
    ticket_code: ticket,
  }).eq('id', booking.id).eq('status', 'Pending');
  if (updateError) return json(res, 500, { error: 'Failed to confirm booking' });

  const fee = Math.round(Number(booking.total) * (FEE_PERCENT / 100) * 100) / 100;
  const net = Math.round((Number(booking.total) - fee) * 100) / 100;

  const { data: existingPayment } = await supabase.from('payments').select('id').eq('provider_reference', reference).maybeSingle();
  if (existingPayment) {
    await supabase.from('payments').update({
      booking_id: booking.id, amount: Number(booking.total), currency: 'ZAR', status: 'paid',
      platform_fee: fee, net_amount: net, raw: data, paid_at: new Date().toISOString(),
    }).eq('id', existingPayment.id);
  } else {
    await supabase.from('payments').insert({
      booking_id: booking.id, provider: 'paystack', provider_reference: reference,
      amount: Number(booking.total), currency: 'ZAR', status: 'paid',
      platform_fee: fee, net_amount: net, raw: data, paid_at: new Date().toISOString(),
    });
  }

  const { data: existingSettlement } = await supabase.from('settlements').select('id').eq('booking_id', booking.id).maybeSingle();
  if (!existingSettlement) {
    await supabase.from('settlements').insert({
      booking_id: booking.id,
      provider_name: 'Solo Soul Experiences',
      gross: Number(booking.total),
      platform_fee: fee,
      provider_amount: net,
      status: 'pending',
      reference,
    });
  }

  const ticketUrl = `${appUrl()}/portal/?ticket=${encodeURIComponent(booking.booking_ref)}`;
  const receiptUrl = `${appUrl()}/portal/`;
  await sendEmail({ to: booking.user_email, subject: `Your ticket — ${booking.event_name}`, html: ticketEmail({ booking, ticketUrl }), bookingId: booking.id, template: 'ticket' });
  await sendEmail({ to: booking.user_email, subject: `Receipt — ${booking.event_name}`, html: receiptEmail({ booking, receiptUrl }), bookingId: booking.id, template: 'receipt' });

  return json(res, 200, { received: true });
}

async function failBooking(res, data) {
  const reference = data.reference || data.metadata?.booking_ref;
  if (!reference) return json(res, 200, { received: true });
  const { data: booking } = await supabase.from('bookings').select('id,status').eq('booking_ref', reference).single();
  if (booking && booking.status === 'Pending') await supabase.from('bookings').update({ status: 'Cancelled' }).eq('id', booking.id);
  await supabase.from('payments').update({ status: 'failed' }).eq('provider_reference', reference).eq('status', 'pending');
  return json(res, 200, { received: true });
}

async function refundUpdate(res, data) {
  const reference = data.transaction_reference || data.reference || data.metadata?.booking_ref;
  const status = data.status === 'failed' ? 'failed' : 'refunded';
  if (!reference) return json(res, 200, { received: true });
  const { data: payment } = await supabase.from('payments').select('*').eq('provider_reference', reference).maybeSingle();
  if (!payment) return json(res, 200, { received: true });

  await supabase.from('refunds').update({ status, updated_at: new Date().toISOString() }).eq('payment_id', payment.id);
  await supabase.from('payments').update({ status: status === 'refunded' ? 'refunded' : 'paid' }).eq('id', payment.id);
  if (status === 'refunded') await supabase.from('bookings').update({ status: 'Refunded' }).eq('id', payment.booking_id);
  return json(res, 200, { received: true });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Method not allowed' }); }
  if (!SECRET) return json(res, 503, { error: 'Paystack is not configured' });

  const signature = req.headers['x-paystack-signature'];
  if (!signature) return json(res, 401, { error: 'Missing signature' });
  const expected = crypto.createHmac('sha512', SECRET).update(JSON.stringify(req.body || {})).digest('hex');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return json(res, 401, { error: 'Invalid signature' });
  }

  try {
    if (req.body?.event === 'charge.success') return await confirmBooking(res, req.body.data || {});
    if (req.body?.event === 'charge.failed' || req.body?.event === 'charge.abandoned') return await failBooking(res, req.body.data || {});
    if (req.body?.event === 'refund.processed' || req.body?.event === 'refund.failed') return await refundUpdate(res, req.body.data || {});
    return json(res, 200, { received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return json(res, 500, { error: 'Webhook failed' });
  }
}
