/**
 * Admin Journal / Blog API.
 * Posts are stored as private JSON objects in Supabase Storage and rendered by
 * the public journal through /api/app action=blog.
 */
import jwt from 'jsonwebtoken';
import { listBlogPosts, getBlogPost, saveBlogPost, deleteBlogPost, CATEGORIES } from '../../lib/blog-store.js';

const JWT_SECRET = process.env.JWT_ADMIN_SECRET || '';

function verifyToken(token) {
  if (!JWT_SECRET) return null;
  try { return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }); } catch { return null; }
}

function requireAdmin(req, res) {
  if (!JWT_SECRET) { res.status(500).json({ error: 'Admin authentication is not configured' }); return null; }
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  const decoded = verifyToken(auth.slice(7));
  if (!decoded) { res.status(401).json({ error: 'Invalid or expired token' }); return null; }
  if (!['admin', 'superadmin'].includes(decoded.role)) { res.status(403).json({ error: 'Admin role required' }); return null; }
  return decoded;
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
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = requireAdmin(req, res);
  if (!admin) return;
  const body = req.body || {};
  const action = body.action;

  try {
    if (action === 'list') {
      return res.json({ posts: await listBlogPosts(), categories: CATEGORIES });
    }
    if (action === 'get') {
      const post = await getBlogPost(body.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      return res.json({ post });
    }
    if (action === 'save') {
      const post = await saveBlogPost({ ...body, author: body.author || admin.name || 'Solo Soul' });
      return res.json({ post });
    }
    if (action === 'delete') {
      const deleted = await deleteBlogPost(body.id);
      if (!deleted) return res.status(404).json({ error: 'Post not found' });
      return res.json({ deleted: true });
    }
    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('Admin blog error:', error);
    const message = error?.message || 'Journal request failed';
    return res.status(500).json({ error: message });
  }
}
