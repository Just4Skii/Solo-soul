/**
 * Admin Events CRUD Endpoint
 * /api/admin/events — Create, Read, Update, Delete events
 * Solo Soul Experiences — 2026-07-16
 *
 * All routes require Bearer JWT token in Authorization header.
 * Supports: list, get, create, update, delete (soft)
 */

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iinvfedcrkibnftzbrlz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || 'solo-soul-admin-secret-2026';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAdmin(req, res) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const decoded = verifyToken(auth.slice(7));
  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
  return decoded;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const { action, ...body } = req.body || {};

  try {
    switch (action) {

      // ── LIST ALL EVENTS ──────────────────────────────────
      case 'list': {
        const { includeInactive } = body;
        let query = supabase.from('events').select('*');
        if (!includeInactive) {
          query = query.eq('active', true);
        }
        const { data, error } = await query.order('date', { ascending: true });
        if (error) throw error;
        return res.json({ events: data });
      }

      // ── GET SINGLE EVENT ─────────────────────────────────
      case 'get': {
        const { id } = body;
        if (!id) return res.status(400).json({ error: 'Event ID required' });
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
        if (error) throw error;
        return res.json({ event: data });
      }

      // ── CREATE EVENT ─────────────────────────────────────
      case 'create': {
        const { event_name, date, location, duration, price, spots_total, category, is_free, description, image_url, is_featured } = body;
        if (!event_name || !date || !location) {
          return res.status(400).json({ error: 'event_name, date, and location required' });
        }
        const { data, error } = await supabase.from('events').insert({
          event_name,
          date,
          location,
          duration: duration || null,
          price: price || null,
          spots_total: spots_total || 10,
          spots_left: spots_total || 10,
          category: category || 'mindful',
          is_free: !!is_free,
          description: description || null,
          image_url: image_url || null,
          is_featured: !!is_featured,
          active: true,
          updated_by: admin.id,
        }).select().single();
        if (error) throw error;
        return res.json({ event: data });
      }

      // ── UPDATE EVENT ─────────────────────────────────────
      case 'update': {
        const { id, ...fields } = body;
        if (!id) return res.status(400).json({ error: 'Event ID required' });

        // Only include valid fields
        const allowed = ['event_name', 'date', 'location', 'duration', 'price', 'spots_total', 'category', 'is_free', 'description', 'image_url', 'is_featured', 'active', 'spots_left'];
        const updateData = { updated_by: admin.id, updated_at: new Date().toISOString() };
        for (const key of allowed) {
          if (fields[key] !== undefined) updateData[key] = fields[key];
        }

        const { data, error } = await supabase.from('events').update(updateData).eq('id', id).select().single();
        if (error) throw error;
        return res.json({ event: data });
      }

      // ── DELETE EVENT (soft) ───────────────────────────────
      case 'delete': {
        const { id } = body;
        if (!id) return res.status(400).json({ error: 'Event ID required' });
        const { data, error } = await supabase.from('events').update({ active: false, updated_by: admin.id, updated_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error) throw error;
        return res.json({ event: data, deleted: true });
      }

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    console.error('Events API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}