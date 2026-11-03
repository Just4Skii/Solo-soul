/**
 * Admin Image Upload Endpoint
 * /api/admin/upload — Upload event images to Supabase Storage
 * Solo Soul Experiences
 *
 * Accepts multipart/form-data with field "image" and returns a public URL.
 * Images stored in Supabase Storage bucket "event-images".
 */

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || '';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT_MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const config = {
  api: { bodyParser: false },
};

function verifyToken(token) {
  if (!JWT_SECRET) return null;
  try { return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }); } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const allowedOrigin = process.env.APP_ORIGIN || 'https://ssoul.co.za';
  if (req.headers.origin && req.headers.origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!JWT_SECRET) { res.status(500).json({ error: 'Admin authentication is not configured' }); return null; }
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const decoded = verifyToken(auth.slice(7));
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });
  if (!['admin', 'superadmin'].includes(decoded.role)) return res.status(403).json({ error: 'Admin role required' });

  try {
    const chunks = [];
    let totalBytes = 0;
    for await (const chunk of req) {
      totalBytes += chunk.length;
      if (totalBytes > MAX_UPLOAD_BYTES) {
        return res.status(413).json({ error: 'Image file exceeds 5 MB limit' });
      }
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const contentType = req.headers['content-type'] || '';
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) return res.status(400).json({ error: 'Missing boundary' });

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

    const extMatch = fileName.toLowerCase().match(/\.(png|jpe?g|webp|gif)$/);
    const ext = extMatch ? `.${extMatch[1]}` : '.png';
    const mimeType = ALLOWED_EXT_MIME[ext] || 'image/png';
    const safeBase = fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'event';

    const filePath = `${Date.now()}-${safeBase}${ext}`;
    const { error } = await supabase.storage
      .from('event-images')
      .upload(filePath, fileData, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(filePath);

    return res.json({ url: publicUrl, path: filePath });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
