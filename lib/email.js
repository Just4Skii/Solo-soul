/**
 * Transactional email delivery. Uses Resend when RESEND_API_KEY is set;
 * every attempt is recorded in email_log so admins can see failures.
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const FROM = process.env.EMAIL_FROM || 'Solo Soul Experiences <bookings@ssoul.co.za>';

export async function sendEmail({ to, subject, html, bookingId = null, template = 'transactional' }) {
  if (!to) return { ok: false, error: 'No recipient' };
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    await log({ bookingId, to, template, status: 'skipped', error: 'RESEND_API_KEY not configured' });
    return { ok: false, skipped: true, error: 'Email provider not configured' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    const data = await res.json().catch(() => ({}));
    await log({ bookingId, to, template, status: res.ok ? 'sent' : 'failed', providerId: data.id || null, error: res.ok ? null : (data.message || 'send failed') });
    return { ok: res.ok, id: data.id };
  } catch (error) {
    await log({ bookingId, to, template, status: 'failed', error: error.message });
    return { ok: false, error: error.message };
  }
}

async function log({ bookingId, to, template, status, providerId, error }) {
  try {
    await supabase.from('email_log').insert({ booking_id: bookingId, recipient: to, template, status, provider_id: providerId, error });
  } catch { /* logging must never break a booking */ }
}

export function ticketEmail({ booking, ticketUrl }) {
  return `
  <div style="font-family:Georgia,serif;max-width:600px;margin:auto;background:#F8EFE4;padding:32px;color:#2A2430">
    <h1 style="font-size:28px;color:#0B3C49;margin:0 0 8px">You're booked.</h1>
    <p style="margin:0 0 20px">Hi ${escape(booking.customer_name || 'there')}, your place is confirmed.</p>
    <div style="background:#fff;border-radius:14px;padding:22px;border:1px solid #EAD6C3">
      <h2 style="font-size:20px;margin:0 0 6px;color:#0B3C49">${escape(booking.event_name)}</h2>
      <p style="margin:0 0 4px">${escape(booking.event_date)} · ${escape(booking.event_location)}</p>
      <p style="margin:0 0 4px">Guests: ${booking.guests}</p>
      <p style="margin:0">Reference: <strong>${escape(booking.booking_ref)}</strong></p>
    </div>
    <p style="margin:22px 0"><a href="${ticketUrl}" style="background:#E76F51;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">View your ticket</a></p>
    <p style="font-size:12px;color:#6b5e63">Bring this ticket on your phone. Questions? Reply to this email or use the Help Centre.</p>
  </div>`;
}

export function receiptEmail({ booking, receiptUrl }) {
  return `
  <div style="font-family:Georgia,serif;max-width:600px;margin:auto;background:#F8EFE4;padding:32px;color:#2A2430">
    <h1 style="font-size:28px;color:#0B3C49;margin:0 0 8px">Payment received</h1>
    <p>Your payment for <strong>${escape(booking.event_name)}</strong> is confirmed.</p>
    <p>Amount: <strong>R${Number(booking.total).toFixed(2)}</strong><br/>Reference: ${escape(booking.booking_ref)}</p>
    <p><a href="${receiptUrl}" style="color:#0B3C49">View receipt</a></p>
  </div>`;
}

function escape(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
