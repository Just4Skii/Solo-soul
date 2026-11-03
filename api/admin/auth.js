/**
 * Admin Authentication Endpoint
 * /api/admin/auth — Login, verify token
 * Solo Soul Experiences
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

function clientIp(req) {
  return String(
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function verifyToken(token) {
  if (!JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (!decoded || !['admin', 'superadmin'].includes(decoded.role)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  const allowedOrigin = process.env.APP_ORIGIN || 'https://ssoul.co.za';
  if (req.headers.origin && req.headers.origin === allowedOrigin) {
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
        return res.status(500).json({ error: 'Admin authentication is not configured.' });
      }
      const ip = clientIp(req);
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
        .eq('email', String(email).toLowerCase().trim())
        .single();

      if (error || !admin || !['admin', 'superadmin'].includes(admin.role)) {
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

      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id);

      const token = jwt.sign(
        { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '2h' }
      );

      const oneTimeHash = process.env.ADMIN_ONE_TIME_HASH || '';
      const mustChangePassword = Boolean(oneTimeHash && admin.password_hash === oneTimeHash);
      return res.json({
        token,
        mustChangePassword,
        admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
      });
    }

    // ── CHANGE PASSWORD ─────────────────────────────────────
    case 'change-password': {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token' });
      }
      const decoded = verifyToken(authHeader.slice(7));
      if (!decoded) return res.status(401).json({ error: 'Invalid or expired token' });

      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password required' });
      }
      if (String(newPassword).length < 12) {
        return res.status(400).json({ error: 'New password must be at least 12 characters' });
      }

      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('id,password_hash')
        .eq('id', decoded.id)
        .single();
      if (error || !admin) return res.status(404).json({ error: 'Admin not found' });

      const valid = await bcrypt.compare(String(currentPassword), admin.password_hash);
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

      const same = await bcrypt.compare(String(newPassword), admin.password_hash);
      if (same) return res.status(400).json({ error: 'Choose a password you have not used here before' });

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(String(newPassword), salt);
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ password_hash: passwordHash })
        .eq('id', decoded.id);
      if (updateError) return res.status(500).json({ error: 'Could not update password' });
      return res.json({ ok: true });
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
      const oneTimeHash = process.env.ADMIN_ONE_TIME_HASH || '';
      let mustChangePassword = false;
      if (oneTimeHash) {
        const { data: adminRow } = await supabase
          .from('admin_users')
          .select('password_hash')
          .eq('id', decoded.id)
          .single();
        mustChangePassword = Boolean(adminRow && adminRow.password_hash === oneTimeHash);
      }
      return res.json({
        valid: true,
        mustChangePassword,
        admin: { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role },
      });
    }

    default:
      return res.status(400).json({ error: 'Unknown action' });
  }
}
