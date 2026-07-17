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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!DATABASE_URL) {
    return res.status(400).json({ error: 'DATABASE_URL not set in env vars' });
  }

  const { email, password, name, role } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name required' });
  }

  const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();

  try {
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
      login: {
        url: '/admin.html',
        email: admin.email,
        password: '[the password you just entered]',
      },
    });
  } catch (err) {
    console.error('Create admin error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create admin' });
  } finally {
    client.release();
    await pool.end();
  }
}