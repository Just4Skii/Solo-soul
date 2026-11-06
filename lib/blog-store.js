/**
 * Journal storage.
 *
 * The production database DDL is not available from the deployment runtime, so
 * posts live as private JSON objects in Supabase Storage. Only the server-side
 * service role can list or read them. The public API exposes published posts.
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'blog-content';
const FOLDER = 'blog-posts';
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const CATEGORIES = ['Self Love', 'Adventure', 'Mindfulness', 'Healing', 'Food & Drink', 'City Notes', 'Wellness', 'Creative'];
const htmlEscape = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plainText = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function sanitizeContent(value) {
  const input = String(value || '').trim();
  if (!input) return '';
  if (!/<[a-z][\s\S]*>/i.test(input)) {
    return input.split(/\n{2,}/).map(block => {
      const text = block.trim();
      if (!text) return '';
      if (/^>\s?/m.test(text)) {
        return `<blockquote>${htmlEscape(text.replace(/^>\s?/gm, '')).replace(/\n/g, '<br>')}</blockquote>`;
      }
      return `<p>${htmlEscape(text).replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

  let html = input
    .replace(/<\s*(script|style|iframe|object|embed|form|link|meta)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|form|link|meta)\b[^>]*\/?\s*>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '');

  const allowed = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li', 'a']);
  html = html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, rawTag, attrs) => {
    const tag = rawTag.toLowerCase();
    if (!allowed.has(tag)) return '';
    if (tag === 'a') {
      const href = (attrs.match(/href\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
      if (!/^(https?:\/\/|mailto:|\/)/i.test(href)) return '<a>';
      return `<a href="${htmlEscape(href)}" rel="noopener noreferrer">`;
    }
    return match.startsWith('</') ? `</${tag}>` : `<${tag}>`;
  });
  return html.slice(0, 50000);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'journal';
}

function categoryClass(category) {
  return String(category || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalisePost(body, existing = null) {
  const title = String(body.title || '').trim().slice(0, 180);
  if (!title) throw new Error('Title is required');
  const content = sanitizeContent(body.content);
  if (!content) throw new Error('Article content is required');
  const category = CATEGORIES.includes(body.category) ? body.category : CATEGORIES[0];
  const excerpt = String(body.excerpt || '').trim().slice(0, 320) || plainText(content).slice(0, 180);
  const status = body.status === 'published' ? 'published' : 'draft';
  const readTime = Math.max(1, Math.min(60, Number(body.read_time) || Math.ceil(plainText(content).split(/\s+/).filter(Boolean).length / 200) || 4));
  const imageUrl = /^(https?:\/\/|\/)/i.test(String(body.image_url || '').trim()) ? String(body.image_url).trim() : '';
  const now = new Date().toISOString();
  return {
    id: existing?.id || crypto.randomUUID(),
    title,
    slug: existing?.slug || `${slugify(title)}-${crypto.randomBytes(3).toString('hex')}`,
    excerpt,
    content,
    category,
    category_class: categoryClass(category),
    image_url: imageUrl,
    image_alt: String(body.image_alt || title).trim().slice(0, 220),
    read_time: readTime,
    featured: Boolean(body.featured),
    status,
    author: String(body.author || existing?.author || 'Solo Soul').trim().slice(0, 80),
    published_at: status === 'published' ? (existing?.published_at || now) : null,
    created_at: existing?.created_at || now,
    updated_at: now,
  };
}

async function readObject(name) {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(BUCKET).download(`${FOLDER}/${name}`);
  if (error || !data) return null;
  try { return JSON.parse(await data.text()); } catch { return null; }
}

export async function listBlogPosts({ publishedOnly = false } = {}) {
  if (!supabase) return [];
  const { data: files, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 200 });
  if (error || !files?.length) return [];
  const posts = (await Promise.all(files.filter(f => f.name.endsWith('.json')).map(f => readObject(f.name))))
    .filter(Boolean)
    .filter(p => !publishedOnly || p.status === 'published')
    .sort((a, b) => String(b.published_at || b.updated_at || '').localeCompare(String(a.published_at || a.updated_at || '')));
  return posts;
}

export async function getBlogPost(id) {
  if (!/^[a-f0-9-]{20,50}$/i.test(String(id || ''))) return null;
  return readObject(`${String(id)}.json`);
}

export async function saveBlogPost(body) {
  const existing = body.id ? await getBlogPost(body.id) : null;
  const post = normalisePost(body, existing);
  if (!supabase) throw new Error('Journal storage is not configured');
  const { error } = await supabase.storage.from(BUCKET).upload(`${FOLDER}/${post.id}.json`, JSON.stringify(post), {
    contentType: 'application/json',
    upsert: true,
  });
  if (error) throw error;
  return post;
}

export async function deleteBlogPost(id) {
  if (!/^[a-f0-9-]{20,50}$/i.test(String(id || ''))) return false;
  if (!supabase) return false;
  const { error } = await supabase.storage.from(BUCKET).remove([`${FOLDER}/${String(id)}.json`]);
  if (error) throw error;
  return true;
}

export { CATEGORIES, sanitizeContent, plainText };
