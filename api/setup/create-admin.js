/**
 * Create Admin User Endpoint
 * /api/setup/create-admin — Create the first admin user
 * Solo Soul Experiences — 2026-07-16
 *
 * Hit this ONCE after init-db to create your admin login.
 * Requires SUPABASE_SERVICE_ROLE_KEY and DATABASE_URL env vars.
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Setup-Token');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const expected = process.env.SETUP_TOKEN;
  const provided = req.headers['x-setup-token'] || (req.body || {}).setupToken;
  if (!expected) {
    return res.status(503).json({ error: 'Setup is disabled. Set SETUP_TOKEN to enable one-time provisioning.' });
  }
  if (!provided || provided !== expected) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!DATABASE_URL) {
    return res.status(400).json({ error: 'DATABASE_URL not set in env vars' });
  }

  const { email, password, name, role } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name required' });
  }
  if (String(password).length < 12) {
    return res.status(400).json({ error: 'Password must be at least 12 characters' });
  }

  const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();

  try {
    // Provisioning is one-time only once an admin exists.
    const existing = await client.query('select count(*)::int as count from public.admin_users');
    if (existing.rows[0].count > 0) {
      return res.status(409).json({ error: 'An admin already exists. Use /admin.html instead.' });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert admin user
    const result = await client.query(
      `INSERT INTO public.admin_users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, name = $3, role = $4
       RETURNING id, email, name, role, created_at`,
      [email.toLowerCase().trim(), passwordHash, name.trim(), role || 'admin']
    );

    const admin = result.rows[0];

    return res.json({
      success: true,
      message: `Admin user "${admin.name}" created`,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        created_at: admin.created_at,
      },
      login: { url: '/admin.html', email: admin.email },
    });
  } catch (err) {
    console.error('Create admin error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create admin' });
  } finally {
    client.release();
    await pool.end();
  }
}