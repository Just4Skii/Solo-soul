/**
 * Admin Image Upload Endpoint
 * /api/admin/upload — Upload event images to Supabase Storage
 * Solo Soul Experiences — 2026-07-16
 *
 * Accepts multipart/form-data with field "image" and returns a public URL.
 * Images stored in Supabase Storage bucket "event-images".
 */

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iinvfedcrkibnftzbrlz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || 'solo-soul-admin-secret-2026';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const config = {
  api: { bodyParser: false },
};

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  if (!verifyToken(auth.slice(7))) return res.status(401).json({ error: 'Invalid token' });

  try {
    // Parse multipart form data
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // Extract filename from Content-Disposition
    const contentType = req.headers['content-type'] || '';
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) return res.status(400).json({ error: 'Missing boundary' });

    // Simple multipart parser
    const parts = buffer.toString('binary').split(`--${boundary}`);
    let fileData = null;
    let fileName = `event-${Date.now()}.png`;

    for (const part of parts) {
      if (part.includes('Content-Disposition') && (part.includes('filename=') || part.includes('image'))) {
        const match = part.match(/filename="?(.+?)"?[\r\n]/);
        if (match) fileName = match[1].replace(/[^a-zA-Z0-9.-]/g, '_');
        const headerEnd = part.indexOf('\r\n\r\n');
        const bodyStart = part.indexOf('\r\n', headerEnd + 4) + 2;
        const bodyEnd = part.lastIndexOf('\r\n--');
        if (bodyEnd > bodyStart) {
          fileData = Buffer.from(part.slice(bodyStart, bodyEnd), 'binary');
        }
        break;
      }
    }

    if (!fileData) return res.status(400).json({ error: 'No image file found in upload' });

    // Upload to Supabase Storage
    const filePath = `${Date.now()}-${fileName}`;
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(filePath, fileData, {
        contentType: req.headers['content-type']?.includes('image') ? req.headers['content-type'] : 'image/png',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(filePath);

    return res.json({ url: publicUrl, path: filePath });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}