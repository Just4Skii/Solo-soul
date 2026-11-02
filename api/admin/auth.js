/**
 * Admin Authentication Endpoint
 * /api/admin/auth — Login, verify token
 * Solo Soul Experiences — 2026-07-16
 *
 * Uses bcryptjs for password hashing and jsonwebtoken for sessions.
 * Admin user data stored in Supabase admin_users table.
 * JWT expires in 2 hours.
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || '';
const attempts = new Map();
const MAX_ATTEMPTS = 6;
const WINDOW_MS = 15 * 60 * 1000;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  // Same-origin by default; set APP_ORIGIN only if the admin UI is hosted elsewhere.
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  const allowedOrigin = process.env.APP_ORIGIN || '';
  if (allowedOrigin && req.headers.origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, ...body } = req.body || {};

  switch (action) {

    // ── LOGIN ──────────────────────────────────────────────
    case 'login': {
      if (!JWT_SECRET) {
        return res.status(500).json({ error: 'Admin authentication is not configured (JWT_ADMIN_SECRET missing).' });
      }
      const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
      const now = Date.now();
      const record = attempts.get(ip);
      if (record && record.count >= MAX_ATTEMPTS && now - record.first < WINDOW_MS) {
        return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
      }
      if (record && now - record.first >= WINDOW_MS) attempts.delete(ip);

      const { email, password } = body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error || !admin) {
        const prev = attempts.get(ip) || { count: 0, first: now };
        attempts.set(ip, { count: prev.count + 1, first: prev.first });
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(String(password), admin.password_hash);
      if (!valid) {
        const prev = attempts.get(ip) || { count: 0, first: now };
        attempts.set(ip, { count: prev.count + 1, first: prev.first });
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      attempts.delete(ip);

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id);

      if (!JWT_SECRET) return res.status(500).json({ error: 'Admin authentication not configured' });
      const token = jwt.sign(
        { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      return res.json({
        token,
        admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
      });
    }

    // ── VERIFY TOKEN ────────────────────────────────────────
    case 'verify': {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ valid: false, error: 'No token' });
      }
      const decoded = verifyToken(authHeader.slice(7));
      if (!decoded) {
        return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
      }
      return res.json({
        valid: true,
        admin: { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role },
      });
    }

    default:
      return res.status(400).json({ error: 'Unknown action' });
  }
}