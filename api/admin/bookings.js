/**
 * Admin Bookings Management Endpoint
 * /api/admin/bookings — View and manage all bookings
 * Solo Soul Experiences — 2026-07-16
 */

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function verifyToken(token) {
  if (!JWT_SECRET) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

function requireAdmin(req, res) {
  if (!JWT_SECRET) { res.status(500).json({ error: 'Admin authentication is not configured' }); return null; }
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  const decoded = verifyToken(auth.slice(7));
  if (!decoded) { res.status(401).json({ error: 'Invalid or expired token' }); return null; }
  if (decoded.role !== 'admin') { res.status(403).json({ error: 'Admin role required' }); return null; }
  return decoded;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const { action, ...body } = req.body || {};

  try {
    switch (action) {

      // ── LIST ALL BOOKINGS ────────────────────────────────
      case 'list': {
        const { status: filter, search } = body;
        let query = supabase.from('bookings').select('*');
        if (filter) query = query.eq('status', filter);
        if (search) {
          const safe = String(search).replace(/[(),]/g, ' ').slice(0, 80);
          query = query.or(`booking_ref.ilike.%${safe}%,user_email.ilike.%${safe}%,event_name.ilike.%${safe}%`);
        }
        const { data, error } = await query.order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        return res.json({ bookings: data });
      }

      // ── UPDATE BOOKING STATUS ─────────────────────────────
      case 'updateStatus': {
        const { id, status } = body;
        if (!id || !status) return res.status(400).json({ error: 'Booking ID and status required' });
        const validStatuses = ['Pending', 'Paid', 'Free', 'Cancelled', 'Refunded'];
        if (!validStatuses.includes(status)) return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
        if (error) throw error;
        return res.json({ booking: data });
      }


      case 'payments': {
        const { data: payments, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        const bookingIds = [...new Set((payments || []).map(p => p.booking_id).filter(Boolean))];
        const { data: bookings } = bookingIds.length ? await supabase.from('bookings').select('id,booking_ref,event_name,user_email,status').in('id', bookingIds) : { data: [] };
        const map = new Map((bookings || []).map(b => [b.id, b]));
        return res.json({ payments: (payments || []).map(p => ({ ...p, booking: map.get(p.booking_id) || null })) });
      }

      case 'refunds': {
        const { data: refunds, error } = await supabase.from('refunds').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        const bookingIds = [...new Set((refunds || []).map(r => r.booking_id).filter(Boolean))];
        const { data: bookings } = bookingIds.length ? await supabase.from('bookings').select('id,booking_ref,event_name,event_date,user_email,total,status').in('id', bookingIds) : { data: [] };
        const map = new Map((bookings || []).map(b => [b.id, b]));
        return res.json({ refunds: (refunds || []).map(r => ({ ...r, booking: map.get(r.booking_id) || null })) });
      }

      case 'refundAction': {
        const { id, decision, note } = body;
        if (!id || !['approve', 'reject'].includes(decision)) return res.status(400).json({ error: 'Refund id and decision required' });
        const { data: refund } = await supabase.from('refunds').select('*').eq('id', id).single();
        if (!refund) return res.status(404).json({ error: 'Refund not found' });
        if (decision === 'reject') {
          const { data, error } = await supabase.from('refunds').update({ status: 'rejected', admin_note: note || null, updated_at: new Date().toISOString() }).eq('id', id).select().single();
          if (error) throw error;
          const { data: settlement } = await supabase.from('settlements').select('*').eq('booking_id', refund.booking_id).maybeSingle();
          await supabase.from('settlement_audit').insert({ settlement_id: settlement?.id || null, booking_id: refund.booking_id, action: 'refund_rejected', previous_status: 'requested', new_status: 'rejected', amount: refund.amount, provider: settlement?.provider_name || 'Solo Soul Experiences', reference: settlement?.reference || null, actor_id: admin.id, actor_email: admin.email, reason: note || 'Refund rejected' });
          return res.json({ refund: data });
        }
        const { data: payment } = refund.payment_id
          ? await supabase.from('payments').select('*').eq('id', refund.payment_id).maybeSingle()
          : await supabase.from('payments').select('*').eq('booking_id', refund.booking_id).eq('status', 'paid').maybeSingle();
        if (!payment?.provider_reference) return res.status(400).json({ error: 'No Paystack transaction linked to this refund' });
        const paystack = await fetch('https://api.paystack.co/refund', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction: payment.provider_reference, amount: Math.round(Number(refund.amount) * 100), merchant_note: note || 'Solo Soul refund' }),
        });
        const result = await paystack.json().catch(() => ({}));
        if (!paystack.ok || !result.status) return res.status(502).json({ error: result.message || 'Paystack refund failed' });
        const { data, error } = await supabase.from('refunds').update({
          status: 'processing',
          provider_refund_ref: result.data?.id ? String(result.data.id) : null,
          admin_note: note || null,
          updated_at: new Date().toISOString(),
        }).eq('id', id).select().single();
        if (error) throw error;
        return res.json({ refund: data, provider: result.data });
      }

      case 'support': {
        const { data: tickets, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        return res.json({ tickets: tickets || [] });
      }

      case 'supportGet': {
        const { id } = body;
        const { data: ticket } = await supabase.from('support_tickets').select('*').eq('id', id).single();
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        const { data: messages } = await supabase.from('support_messages').select('*').eq('ticket_id', id).order('created_at');
        return res.json({ ticket, messages: messages || [] });
      }

      case 'supportReply': {
        const { id, message, status } = body;
        if (!id || !message) return res.status(400).json({ error: 'Ticket id and message required' });
        await supabase.from('support_messages').insert({ ticket_id: id, author_type: 'admin', author_name: admin.name || 'Support', message });
        const patch = { updated_at: new Date().toISOString() };
        if (status) patch.status = status;
        const { data, error } = await supabase.from('support_tickets').update(patch).eq('id', id).select().single();
        if (error) throw error;
        return res.json({ ticket: data });
      }

      case 'settlementAudit': {
        const { data, error } = await supabase.from('settlement_audit').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        return res.json({ audit: data || [] });
      }

      case 'settlements': {
        const { data, error } = await supabase.from('settlements').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        return res.json({ settlements: data || [] });
      }

      case 'settle': {
        const { id } = body;
        const { data: before } = await supabase.from('settlements').select('*').eq('id', id).single();
        if (!before) return res.status(404).json({ error: 'Settlement not found' });
        const { data, error } = await supabase.from('settlements').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error) throw error;
        await supabase.from('settlement_audit').insert({
          settlement_id: id, booking_id: before.booking_id, action: 'marked_paid', previous_status: before.status, new_status: 'paid',
          amount: before.provider_amount, provider: before.provider_name, reference: before.reference,
          actor_id: admin.id, actor_email: admin.email, reason: body.reason || 'Settlement approved and marked paid', metadata: { gross: before.gross, platform_fee: before.platform_fee },
        });
        return res.json({ settlement: data });
      }


      case 'emails': {
        const { data, error } = await supabase.from('email_log').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        return res.json({ emails: data || [] });
      }

      case 'reconcile': {
        const key = process.env.PAYSTACK_SECRET_KEY;
        if (!key) return res.status(503).json({ error: 'Paystack not configured' });
        const tx = await fetch('https://api.paystack.co/transaction?perPage=100&status=success', { headers: { Authorization: `Bearer ${key}` } });
        const tj = await tx.json();
        if (!tx.ok || !tj.status) return res.status(502).json({ error: tj.message || 'Paystack query failed' });
        const remote = (tj.data || []).filter(t => t.currency === 'ZAR');
        const { data: payments } = await supabase.from('payments').select('*');
        const byRef = new Map((payments || []).map(p => [p.provider_reference, p]));
        const missingInternal = remote.filter(t => !byRef.has(t.reference)).map(t => ({ reference: t.reference, amount: t.amount / 100, paid_at: t.paid_at }));
        const remoteRefs = new Set(remote.map(t => t.reference));
        const missingProvider = (payments || []).filter(p => p.status === 'paid' && p.provider_reference && !remoteRefs.has(p.provider_reference)).map(p => ({ reference: p.provider_reference, amount: p.amount }));
        return res.json({
          summary: { paystackTransactions: remote.length, internalPayments: (payments || []).length, missingInternal: missingInternal.length, missingProvider: missingProvider.length },
          missingInternal, missingProvider,
        });
      }

      case 'hardenAudit': {
        if (!process.env.SETUP_TOKEN || req.headers['x-setup-token'] !== process.env.SETUP_TOKEN) return res.status(403).json({ error: 'Forbidden' });
        const cs = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_URL;
        const u = new URL(cs); u.searchParams.delete('sslmode'); u.searchParams.delete('ssl');
        const c = new pg.Client({ connectionString: u.toString(), ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
        await c.connect();
        await c.query(`create or replace function public.deny_audit_mutation() returns trigger language plpgsql as 'begin raise exception ''settlement_audit is append-only''; end;';
        drop trigger if exists settlement_audit_immutable on public.settlement_audit;
        create trigger settlement_audit_immutable before update or delete on public.settlement_audit for each row execute function public.deny_audit_mutation();`);
        await c.end();
        return res.json({ ok: true });
      }

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    console.error('Bookings error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}