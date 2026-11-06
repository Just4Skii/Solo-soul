/**
 * Customer account, booking, ticket, payment, refund and support API.
 * All customer data is read with the service role after verifying the caller's
 * Supabase access token, so RLS can stay closed to the browser.
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, ticketEmail } from '../lib/email.js';
import { sharePage } from '../lib/share-page.js';
import { trackServer } from '../lib/analytics.js';
import { listBlogPosts } from '../lib/blog-store.js';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const ANALYTICS_TYPES = new Set(['pageview', 'event_view', 'outbound_click', 'registration', 'booking_start', 'booking_completed']);

const rateLimits = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000;

function clientIp(req) {
  return String(
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(req, bucket, maxRequests) {
  const key = `${bucket}:${clientIp(req)}`;
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now - entry.start >= RATE_WINDOW_MS) {
    rateLimits.set(key, { count: 1, start: now });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count += 1;
  return true;
}

function json(res, status, payload) { res.status(status).json(payload); }

function analyticsMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const safe = {};
  for (const [key, raw] of Object.entries(value).slice(0, 8)) {
    const name = String(key).slice(0, 40);
    if (typeof raw === 'string') safe[name] = raw.slice(0, 500);
    else if (typeof raw === 'number' || typeof raw === 'boolean') safe[name] = raw;
  }
  return Object.keys(safe).length ? safe : null;
}

async function authUser(req) {
  const header = req.headers['authorization'] || '';
  if (!header.startsWith('Bearer ')) return null;
  const { data, error } = await supabase.auth.getUser(header.slice(7));
  if (error) return null;
  return data.user;
}

function bookingRef() {
  return 'SS-' + crypto.randomBytes(5).toString('hex').toUpperCase();
}

function ticketCode() {
  return 'SS-' + crypto.randomBytes(8).toString('hex').toUpperCase();
}

function safeUserFilter(user) {
  const safeId = String(user.id || '').replace(/[^a-fA-F0-9-]/g, '');
  const safeEmail = String(user.email || '').trim().toLowerCase().replace(/["(),\\]/g, '');
  return `user_id.eq.${safeId},user_email.eq."${safeEmail}"`;
}

function ownsBooking(user, booking) {
  if (!user || !booking) return false;
  const uEmail = String(user.email || '').trim().toLowerCase();
  const bEmail = String(booking.user_email || '').trim().toLowerCase();
  return (booking.user_id && booking.user_id === user.id) || (uEmail && bEmail === uEmail);
}

function ownsSupportTicket(user, ticket) {
  if (!user || !ticket) return false;
  const uEmail = String(user.email || '').trim().toLowerCase();
  const tEmail = String(ticket.email || '').trim().toLowerCase();
  return (ticket.user_id && ticket.user_id === user.id) || (uEmail && tEmail === uEmail);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'GET' && req.query?.share) return sharePage(req, res, String(req.query.share));
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Method not allowed' }); }

  const body = req.body || {};
  const action = body.action;
  const user = await authUser(req);

  try {
    switch (action) {
      case 'track': {
        if (!checkRateLimit(req, 'track', 120)) return res.status(204).end();
        const eventType = String(body.eventType || '').trim();
        if (!ANALYTICS_TYPES.has(eventType)) return res.status(204).end();
        const userAgent = String(req.headers['user-agent'] || '');
        if (/bot|crawler|spider|headless|lighthouse|facebookexternalhit/i.test(userAgent)) return res.status(204).end();

        const visitorId = String(body.visitorId || '');
        if (!/^[a-zA-Z0-9_-]{8,64}$/.test(visitorId)) return res.status(204).end();
        const pathValue = String(body.path || '/');
        await trackServer(eventType, {
          visitorId,
          path: pathValue.startsWith('/') ? pathValue.slice(0, 200) : '/',
          eventId: body.eventId,
          eventName: body.eventName,
          source: body.source,
          medium: body.medium,
          campaign: body.campaign,
          referrer: body.referrer,
          device: body.device,
          country: req.headers['x-vercel-ip-country'] || null,
          metadata: analyticsMetadata(body.metadata),
        });
        return res.status(204).end();
      }

      case 'experiences': {
        const { data, error } = await supabase.from('events').select('*').eq('active', true).order('date', { ascending: true });
        if (error) throw error;
        return json(res, 200, { experiences: data || [] });
      }

      case 'blog': {
        return json(res, 200, { posts: await listBlogPosts({ publishedOnly: true }) });
      }

      case 'experience': {
        const id = String(body.id || '');
        const { data, error } = await supabase.from('events').select('*').eq('id', id).eq('active', true).single();
        if (error || !data) return json(res, 404, { error: 'Experience not found' });
        return json(res, 200, { experience: data });
      }

      case 'my-bookings': {
        if (!user) return json(res, 401, { error: 'Sign in required' });
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('*')
          .or(safeUserFilter(user))
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
          const t = await supabase.from('support_tickets').select('*').eq('email', String(user.email || '').toLowerCase()).order('created_at', { ascending: false });
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
        if (!checkRateLimit(req, 'booking-lookup', 20)) {
          return json(res, 429, { error: 'Too many lookup attempts. Please wait a few minutes.' });
        }
        const ref = String(body.ref || '').trim();
        if (!ref) return json(res, 400, { error: 'Booking reference required' });
        const { data: booking, error } = await supabase.from('bookings').select('*').eq('booking_ref', ref).single();
        if (error || !booking) return json(res, 404, { error: 'Booking not found' });

        if (ownsBooking(user, booking)) {
          return json(res, 200, { booking });
        }

        const guestEmail = String(body.email || '').trim().toLowerCase();
        if (user || !guestEmail || String(booking.user_email || '').trim().toLowerCase() !== guestEmail) {
          return json(res, 403, { error: 'Not authorised for this booking' });
        }

        // For unauthenticated guest ticket views, redact sensitive internal/PII fields (notes, payment_intent_id, user_id)
        const redactedBooking = {
          id: booking.id,
          booking_ref: booking.booking_ref,
          event_id: booking.event_id,
          event_name: booking.event_name,
          event_date: booking.event_date,
          event_location: booking.event_location,
          guests: booking.guests,
          total: booking.total,
          price_per_guest: booking.price_per_guest,
          status: booking.status,
          ticket_code: booking.ticket_code,
          created_at: booking.created_at,
        };
        return json(res, 200, { booking: redactedBooking });
      }

      case 'create-free': {
        if (!checkRateLimit(req, 'create-free', 10)) {
          return json(res, 429, { error: 'Too many booking requests. Please try again later.' });
        }
        const { eventId, name, email, guests = 1, notes = '' } = body;
        if (!eventId || !name || !email) return json(res, 400, { error: 'eventId, name and email are required' });
        const seats = Math.max(1, Math.min(10, Number(guests) || 1));
        const { data: event, error } = await supabase.from('events').select('id,event_name,date,location,price,is_free,spots_left,active').eq('id', eventId).single();
        if (error || !event || event.active === false) return json(res, 404, { error: 'Event not found' });
        if (!event.is_free) return json(res, 400, { error: 'This event requires payment' });
        if (Number(event.spots_left) < seats) return json(res, 409, { error: 'Not enough spots left' });

        const ref = bookingRef();
        const code = ticketCode();
        const normalizedEmail = user ? String(user.email).toLowerCase().trim() : String(email).toLowerCase().trim();
        const { data: booking, error: insertError } = await supabase.from('bookings').insert({
          booking_ref: ref,
          user_id: user ? user.id : null,
          user_email: normalizedEmail,
          customer_name: String(name).trim().slice(0, 120),
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

        await trackServer('booking_completed', {
          path: '/portal/',
          eventId: event.id,
          eventName: event.event_name,
          source: 'ssoul',
          medium: 'free',
          metadata: { booking_ref: ref, guests: seats, total: 0 },
        });

        const ticketUrl = `${process.env.APP_URL || 'https://ssoul.co.za'}/portal/?ticket=${encodeURIComponent(ref)}`;
        await sendEmail({ to: booking.user_email, subject: `Your ticket — ${booking.event_name}`, html: ticketEmail({ booking, ticketUrl }), bookingId: booking.id, template: 'ticket' });
        return json(res, 200, { booking, ticket_url: ticketUrl });
      }

      case 'payments': {
        if (!user) return json(res, 401, { error: 'Sign in required' });
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('id,booking_ref,user_email,event_name,total,status,created_at')
          .or(safeUserFilter(user));
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
        if (!ownsBooking(user, booking)) return json(res, 403, { error: 'Not your booking' });
        if (booking.status !== 'Paid') return json(res, 400, { error: 'Only paid bookings can be refunded' });

        const { data: existing } = await supabase.from('refunds').select('id,status').eq('booking_id', booking.id).in('status', ['requested', 'approved', 'processing']).maybeSingle();
        if (existing) return json(res, 200, { refund: existing, already_requested: true });

        const { data: payment } = await supabase.from('payments').select('*').eq('booking_id', booking.id).eq('status', 'paid').order('created_at', { ascending: false }).maybeSingle();
        if (!payment) return json(res, 400, { error: 'No verified payment record found for this booking' });

        const { data: refund, error: refundError } = await supabase.from('refunds').insert({
          booking_id: booking.id,
          payment_id: payment.id,
          amount: Number(payment.amount || booking.total),
          reason,
          status: 'requested',
          requested_by: user.id,
        }).select().single();
        if (refundError) throw refundError;

        await supabase.from('support_tickets').insert({
          user_id: user.id, email: String(user.email).toLowerCase(), name: booking.customer_name || user.email,
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
        if (!ownsBooking(user, booking)) return json(res, 403, { error: 'Not your booking' });
        if (['Cancelled', 'Refunded'].includes(booking.status)) return json(res, 400, { error: 'Booking is already cancelled' });
        const eventTime = new Date(booking.event_date).getTime();
        if (eventTime < Date.now()) return json(res, 400, { error: 'Past bookings cannot be cancelled online — contact support' });

        await supabase.from('bookings').update({ status: 'Cancelled', cancelled_at: new Date().toISOString() }).eq('id', booking.id);
        if (booking.status === 'Paid') {
          await supabase.from('support_tickets').insert({
            user_id: user.id, email: String(user.email).toLowerCase(), name: booking.customer_name || user.email,
            booking_ref: booking.booking_ref, category: 'refund',
            subject: `Cancellation & refund — ${booking.booking_ref}`,
            message: 'Customer cancelled online and requested a refund review.', priority: 'high',
          });
        }
        return json(res, 200, { cancelled: true, refund_review: booking.status === 'Paid' });
      }

      case 'support/create': {
        if (!checkRateLimit(req, 'support-create', 10)) {
          return json(res, 429, { error: 'Too many support requests. Please wait a few minutes.' });
        }
        const email = String((user && user.email) || body.email || '').trim().toLowerCase();
        const subject = String(body.subject || '').trim().slice(0, 160);
        const message = String(body.message || '').trim().slice(0, 4000);
        const authorName = String(body.name || (user && user.user_metadata?.full_name) || '').trim().slice(0, 120) || null;
        if (!email || !subject || !message) return json(res, 400, { error: 'Email, subject and message are required' });
        const { data: ticket, error } = await supabase.from('support_tickets').insert({
          user_id: user ? user.id : null, email, name: authorName,
          booking_ref: body.booking_ref ? String(body.booking_ref).trim().slice(0, 40) : null,
          category: body.category || 'other',
          subject, message, status: 'open', priority: 'normal',
        }).select().single();
        if (error) throw error;
        await supabase.from('support_messages').insert({ ticket_id: ticket.id, author_type: 'customer', author_name: authorName || email, message });
        return json(res, 200, { ticket });
      }

      case 'support/list': {
        if (!user) return json(res, 401, { error: 'Sign in required to view support tickets' });
        const email = String(user.email || '').trim().toLowerCase();
        const { data, error } = await supabase.from('support_tickets').select('*').eq('email', email).order('created_at', { ascending: false });
        if (error) throw error;
        return json(res, 200, { tickets: data || [] });
      }

      case 'support/get': {
        if (!user) return json(res, 401, { error: 'Sign in required to view support thread' });
        const id = String(body.id || '');
        const { data: ticket, error } = await supabase.from('support_tickets').select('*').eq('id', id).single();
        if (error || !ticket) return json(res, 404, { error: 'Ticket not found' });
        if (!ownsSupportTicket(user, ticket)) return json(res, 403, { error: 'Not authorised' });
        const { data: messages } = await supabase.from('support_messages').select('*').eq('ticket_id', id).order('created_at');
        return json(res, 200, { ticket, messages: messages || [] });
      }

      case 'support/reply': {
        if (!user) return json(res, 401, { error: 'Sign in required to reply to a support ticket' });
        const id = String(body.id || '');
        const message = String(body.message || '').trim().slice(0, 4000);
        if (!id || !message) return json(res, 400, { error: 'Ticket and message required' });
        const { data: ticket } = await supabase.from('support_tickets').select('*').eq('id', id).single();
        if (!ticket) return json(res, 404, { error: 'Ticket not found' });
        if (!ownsSupportTicket(user, ticket)) return json(res, 403, { error: 'Not authorised' });
        await supabase.from('support_messages').insert({ ticket_id: id, author_type: 'customer', author_name: user.email, message });
        await supabase.from('support_tickets').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', id);
        return json(res, 200, { ok: true });
      }

      default:
        return json(res, 400, { error: 'Unknown action' });
    }
  } catch (error) {
    console.error('App API error:', action, error);
    return json(res, 500, { error: 'Request failed' });
  }
}
