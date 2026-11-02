/**
 * Customer account, booking, ticket, payment, refund and support API.
 * All customer data is read with the service role after verifying the caller's
 * Supabase access token, so RLS can stay closed to the browser.
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, ticketEmail } from '../lib/email.js';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

function json(res, status, payload) { res.status(status).json(payload); }

async function authUser(req) {
  const header = req.headers['authorization'] || '';
  if (!header.startsWith('Bearer ')) return null;
  const { data, error } = await supabase.auth.getUser(header.slice(7));
  if (error) return null;
  return data.user;
}

function ticketCode() { return crypto.randomBytes(8).toString('hex'); }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Method not allowed' }); }

  const body = req.body || {};
  const action = body.action;
  const user = await authUser(req);

  try {
    switch (action) {
      case 'my-bookings': {
        if (!user) return json(res, 401, { error: 'Sign in required' });
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('*')
          .or(`user_id.eq.${user.id},user_email.eq.${user.email}`)
          .order('created_at', { ascending: false });
        if (error) throw error;

        const bookingIds = (bookings || []).map(b => b.id);
        let refunds = [];
        let tickets = [];
        try {
          const r = bookingIds.length ? await supabase.from('refunds').select('*').in('booking_id', bookingIds) : { data: [] };
          refunds = r.data || [];
        } catch { /* table may not exist on older deployments */ }
        try {
          const t = await supabase.from('support_tickets').select('*').eq('email', user.email).order('created_at', { ascending: false });
          tickets = t.data || [];
        } catch { /* ignore */ }

        return json(res, 200, {
          bookings: (bookings || []).map(b => ({
            ...b,
            ticket_url: `/portal/?ticket=${encodeURIComponent(b.booking_ref)}`,
            refund: (refunds || []).find(r => r.booking_id === b.id) || null,
          })),
          support: tickets,
        });
      }

      case 'booking': {
        const ref = String(body.ref || '').trim();
        if (!ref) return json(res, 400, { error: 'Booking reference required' });
        const { data: booking, error } = await supabase.from('bookings').select('*').eq('booking_ref', ref).single();
        if (error || !booking) return json(res, 404, { error: 'Booking not found' });
        const owns = user && (booking.user_id === user.id || booking.user_email === user.email);
        const guestEmail = String(body.email || '').trim().toLowerCase();
        if (!owns && booking.user_email !== guestEmail) return json(res, 403, { error: 'Not authorised for this booking' });
        return json(res, 200, { booking });
      }

      case 'create-free': {
        const { eventId, name, email, guests = 1, notes = '' } = body;
        if (!eventId || !name || !email) return json(res, 400, { error: 'eventId, name and email are required' });
        const seats = Math.max(1, Math.min(10, Number(guests) || 1));
        const { data: event, error } = await supabase.from('events').select('id,event_name,date,location,price,is_free,spots_left,active').eq('id', eventId).single();
        if (error || !event) return json(res, 404, { error: 'Event not found' });
        if (!event.is_free) return json(res, 400, { error: 'This event requires payment' });
        if (Number(event.spots_left) < seats) return json(res, 409, { error: 'Not enough spots left' });

        const ref = 'SS-' + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(1000 + Math.random() * 9000);
        const code = ticketCode();
        const { data: booking, error: insertError } = await supabase.from('bookings').insert({
          booking_ref: ref,
          user_id: user ? user.id : null,
          user_email: String(email).toLowerCase().trim(),
          customer_name: name,
          event_id: event.id,
          event_name: event.event_name,
          event_date: event.date,
          event_location: event.location,
          guests: seats,
          total: 0,
          price_per_guest: 'FREE',
          status: 'Free',
          notes: String(notes || '').slice(0, 500),
          ticket_code: code,
        }).select().single();
        if (insertError) throw insertError;

        const ticketUrl = `${process.env.APP_URL || 'https://ssoul.co.za'}/portal/?ticket=${encodeURIComponent(ref)}`;
        await sendEmail({ to: booking.user_email, subject: `Your ticket — ${booking.event_name}`, html: ticketEmail({ booking, ticketUrl }), bookingId: booking.id, template: 'ticket' });
        return json(res, 200, { booking, ticket_url: ticketUrl });
      }

      case 'payments': {
        if (!user) return json(res, 401, { error: 'Sign in required' });
        const { data: bookings, error } = await supabase.from('bookings').select('id,booking_ref,user_email,event_name,total,status,created_at').or(`user_id.eq.${user.id},user_email.eq.${user.email}`);
        if (error) throw error;
        const ids = (bookings || []).map(b => b.id);
        let payments = [];
        if (ids.length) {
          const { data } = await supabase.from('payments').select('*').in('booking_id', ids).order('created_at', { ascending: false });
          payments = data || [];
        }
        return json(res, 200, { bookings: bookings || [], payments });
      }

      case 'request-refund': {
        if (!user) return json(res, 401, { error: 'Sign in required' });
        const ref = String(body.ref || '').trim();
        const reason = String(body.reason || '').trim().slice(0, 1000);
        if (!ref || !reason) return json(res, 400, { error: 'Booking reference and reason are required' });
        const { data: booking, error } = await supabase.from('bookings').select('*').eq('booking_ref', ref).single();
        if (error || !booking) return json(res, 404, { error: 'Booking not found' });
        if (booking.user_id !== user.id && booking.user_email !== user.email) return json(res, 403, { error: 'Not your booking' });
        if (booking.status !== 'Paid') return json(res, 400, { error: 'Only paid bookings can be refunded' });

        const { data: existing } = await supabase.from('refunds').select('id,status').eq('booking_id', booking.id).in('status', ['requested', 'approved', 'processing']).maybeSingle();
        if (existing) return json(res, 200, { refund: existing, already_requested: true });

        const { data: payment } = await supabase.from('payments').select('*').eq('booking_id', booking.id).eq('status', 'paid').order('created_at', { ascending: false }).maybeSingle();
        const { data: refund, error: refundError } = await supabase.from('refunds').insert({
          booking_id: booking.id,
          payment_id: payment ? payment.id : null,
          amount: Number(booking.total),
          reason,
          status: 'requested',
          requested_by: user.id,
        }).select().single();
        if (refundError) throw refundError;

        await supabase.from('support_tickets').insert({
          user_id: user.id, email: user.email, name: booking.customer_name || user.email,
          booking_ref: booking.booking_ref, category: 'refund',
          subject: `Refund request — ${booking.booking_ref}`,
          message: reason, status: 'open', priority: 'high',
        });
        return json(res, 200, { refund });
      }

      case 'cancel-booking': {
        if (!user) return json(res, 401, { error: 'Sign in required' });
        const ref = String(body.ref || '').trim();
        const { data: booking, error } = await supabase.from('bookings').select('*').eq('booking_ref', ref).single();
        if (error || !booking) return json(res, 404, { error: 'Booking not found' });
        if (booking.user_id !== user.id && booking.user_email !== user.email) return json(res, 403, { error: 'Not your booking' });
        if (['Cancelled', 'Refunded'].includes(booking.status)) return json(res, 400, { error: 'Booking is already cancelled' });
        const eventTime = new Date(booking.event_date).getTime();
        if (eventTime < Date.now()) return json(res, 400, { error: 'Past bookings cannot be cancelled online — contact support' });

        await supabase.from('bookings').update({ status: 'Cancelled', cancelled_at: new Date().toISOString() }).eq('id', booking.id);
        if (booking.status === 'Paid') {
          await supabase.from('support_tickets').insert({
            user_id: user.id, email: user.email, name: booking.customer_name || user.email,
            booking_ref: booking.booking_ref, category: 'refund',
            subject: `Cancellation & refund — ${booking.booking_ref}`,
            message: 'Customer cancelled online and requested a refund review.', priority: 'high',
          });
        }
        return json(res, 200, { cancelled: true, refund_review: booking.status === 'Paid' });
      }

      case 'support/create': {
        const email = String(body.email || (user && user.email) || '').trim().toLowerCase();
        const subject = String(body.subject || '').trim().slice(0, 160);
        const message = String(body.message || '').trim().slice(0, 4000);
        if (!email || !subject || !message) return json(res, 400, { error: 'Email, subject and message are required' });
        const { data: ticket, error } = await supabase.from('support_tickets').insert({
          user_id: user ? user.id : null, email, name: body.name || (user && user.user_metadata?.full_name) || null,
          booking_ref: body.booking_ref || null, category: body.category || 'other',
          subject, message, status: 'open', priority: body.priority || 'normal',
        }).select().single();
        if (error) throw error;
        await supabase.from('support_messages').insert({ ticket_id: ticket.id, author_type: 'customer', author_name: body.name || email, message });
        return json(res, 200, { ticket });
      }

      case 'support/list': {
        const email = String((user && user.email) || body.email || '').trim().toLowerCase();
        if (!email) return json(res, 401, { error: 'Sign in or provide an email' });
        const { data, error } = await supabase.from('support_tickets').select('*').eq('email', email).order('created_at', { ascending: false });
        if (error) throw error;
        return json(res, 200, { tickets: data || [] });
      }

      case 'support/get': {
        const id = String(body.id || '');
        const { data: ticket, error } = await supabase.from('support_tickets').select('*').eq('id', id).single();
        if (error || !ticket) return json(res, 404, { error: 'Ticket not found' });
        const owns = (user && ticket.email === user.email) || (!user && ticket.email === String(body.email || '').toLowerCase());
        if (!owns) return json(res, 403, { error: 'Not authorised' });
        const { data: messages } = await supabase.from('support_messages').select('*').eq('ticket_id', id).order('created_at');
        return json(res, 200, { ticket, messages: messages || [] });
      }

      case 'support/reply': {
        const id = String(body.id || '');
        const message = String(body.message || '').trim().slice(0, 4000);
        if (!id || !message) return json(res, 400, { error: 'Ticket and message required' });
        const { data: ticket } = await supabase.from('support_tickets').select('*').eq('id', id).single();
        if (!ticket) return json(res, 404, { error: 'Ticket not found' });
        const owns = (user && ticket.email === user.email) || ticket.email === String(body.email || '').toLowerCase();
        if (!owns) return json(res, 403, { error: 'Not authorised' });
        await supabase.from('support_messages').insert({ ticket_id: id, author_type: 'customer', author_name: user?.email || ticket.email, message });
        await supabase.from('support_tickets').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', id);
        return json(res, 200, { ok: true });
      }

      default:
        return json(res, 400, { error: 'Unknown action' });
    }
  } catch (error) {
    console.error('App API error:', action, error);
    return json(res, 500, { error: error.message || 'Request failed' });
  }
}
