/**
 * Admin Bookings Management Endpoint
 * /api/admin/bookings — View and manage all bookings
 * Solo Soul Experiences — 2026-07-16
 */

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

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

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    console.error('Bookings error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}