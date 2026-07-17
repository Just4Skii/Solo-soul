/**
 * Database Initialization Endpoint
 * /api/setup/init-db — One-click database schema setup
 * Solo Soul Experiences — 2026-07-16
 *
 * Hit this endpoint ONCE after deploying to create all database tables.
 * Requires DATABASE_URL env var (your Supabase PostgreSQL connection string).
 *
 * How to get DATABASE_URL:
 *   Supabase Dashboard → Project Settings → Database → Connection string → URI
 *   Looks like: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iinvfedcrkibnftzbrlz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Full SQL Schema as a single safe string ─────────────────
const SQL_SCHEMA = `

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  name text not null,
  phone text,
  preferences jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Events table
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  event_name text not null,
  date date not null,
  location text not null,
  duration text,
  price text,
  spots_total integer not null default 10,
  spots_left integer not null default 10,
  category text not null check (category in ('nature', 'creative', 'dining', 'luxury', 'mindful')),
  is_free boolean default false,
  active boolean default true,
  image_url text,
  description text,
  is_featured boolean default false,
  updated_by uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Booking reservations
create table if not exists public.booking_reservations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  event_id uuid references public.events on delete cascade,
  guests integer not null default 1,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Bookings table
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  booking_ref text unique not null,
  user_id uuid references auth.users on delete cascade,
  user_email text not null,
  event_id uuid references public.events on delete cascade,
  event_name text not null,
  event_date date not null,
  event_location text not null,
  guests integer not null,
  total numeric not null,
  price_per_guest text,
  status text not null check (status in ('Pending', 'Paid', 'Free', 'Cancelled', 'Refunded')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  payment_intent_id text
);

-- Admin users table
create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  role text not null default 'admin' check (role in ('admin', 'superadmin')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  last_login timestamp with time zone
);

-- Ticket verifications
create table if not exists public.ticket_verifications (
  id uuid primary key default uuid_generate_v4(),
  event_title text not null,
  source_url text not null,
  status text not null check (status in ('verified', 'dead', 'redirected')),
  suggested_url text,
  checked_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes
create index if not exists idx_events_date on public.events(date);
create index if not exists idx_events_active on public.events(active);
create index if not exists idx_events_category on public.events(category);
create index if not exists idx_bookings_user on public.bookings(user_id);
create index if not exists idx_bookings_event on public.bookings(event_id);
create index if not exists idx_reservations_expires on public.booking_reservations(expires_at);
create index if not exists idx_ticket_verifications_title on public.ticket_verifications(event_title);
create index if not exists idx_ticket_verifications_checked on public.ticket_verifications(checked_at);

-- Enable RLS
alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_reservations enable row level security;
alter table public.admin_users enable row level security;

-- RLS Policies
create policy if not exists "users_can_crud_own" on public.users
  for all using (auth.uid() = id);

create policy if not exists "events_public_read" on public.events
  for select using (true);

create policy if not exists "events_admin_write" on public.events
  for all using (auth.uid() in (select id from public.users where email in ('admin@solosoul.co.za')));

create policy if not exists "bookings_own_only" on public.bookings
  for all using (auth.uid() = user_id);

create policy if not exists "reservations_own_only" on public.booking_reservations
  for all using (auth.uid() = user_id);

create policy if not exists "admin_users_self_only" on public.admin_users
  for select using (auth.uid() = id);
`.trim();

// ── Trigger functions (run separately) ──────────────────────
const SQL_TRIGGERS = `
-- Trigger function: update spots when booking confirmed
create or replace function public.update_event_spots()
returns trigger
language plpgsql
as $func$
begin
  if NEW.status = 'Paid' or NEW.status = 'Free' then
    update public.events
    set spots_left = spots_left - NEW.guests,
        updated_at = timezone('utc'::text, now())
    where id = NEW.event_id
    and spots_left >= NEW.guests;

    if not found then
      raise exception 'Not enough spots available for event %', NEW.event_id;
    end if;
  elsif NEW.status = 'Cancelled' or NEW.status = 'Refunded' then
    update public.events
    set spots_left = spots_left + NEW.guests,
        updated_at = timezone('utc'::text, now())
    where id = NEW.event_id;
  end if;
  return NEW;
end;
$func$;

-- Create trigger
drop trigger if exists trigger_update_spots on public.bookings;
create trigger trigger_update_spots
  after insert or update on public.bookings
  for each row execute procedure public.update_event_spots();
`.trim();

// ── CORS headers ────────────────────────────────────────────
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

// ── Main handler ────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // ── GET: Show setup status ──────────────────────────────
  if (req.method === 'GET') {
    try {
      // Check what tables exist
      const tables = ['events', 'bookings', 'booking_reservations', 'users', 'admin_users', 'ticket_verifications'];
      const statuses = {};
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('id').limit(1);
          statuses[table] = !error ? '✅ ready' : '❌ missing';
        } catch {
          statuses[table] = '❌ missing';
        }
      }

      return res.json({
        status: 'Database Setup Check',
        tables: statuses,
        hasDatabaseUrl: !!DATABASE_URL,
        message: DATABASE_URL
          ? 'DATABASE_URL is set. POST to this endpoint to run setup.'
          : 'Set DATABASE_URL env var (Supabase connection string) to enable setup.',
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: Run database setup ────────────────────────────
  if (req.method === 'POST') {
    if (!DATABASE_URL) {
      return res.status(400).json({
        error: 'DATABASE_URL not set',
        fix: 'Add DATABASE_URL to Vercel env vars. Get it from: Supabase Dashboard → Project Settings → Database → Connection string (URI)',
      });
    }

    const { runTriggers } = req.body || {};

    const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    const client = await pool.connect();

    try {
      const results = [];

      // Run schema SQL (split by semicolons for safety)
      const statements = SQL_SCHEMA.split(';').filter(s => s.trim().length > 0);
      let successCount = 0;
      let errorCount = 0;

      for (const stmt of statements) {
        try {
          await client.query(stmt + ';');
          successCount++;
        } catch (err) {
          // Skip "already exists" errors
          if (err.message.includes('already exists')) {
            successCount++;
          } else {
            errorCount++;
            results.push({ error: err.message.substring(0, 200) });
          }
        }
      }

      // Run triggers if requested
      if (runTriggers) {
        try {
          const triggerStmts = SQL_TRIGGERS.split(';').filter(s => s.trim().length > 0);
          for (const stmt of triggerStmts) {
            await client.query(stmt + ';');
          }
          results.push({ triggers: '✅ Created' });
        } catch (err) {
          results.push({ triggers: '⚠️ ' + err.message.substring(0, 200) });
        }
      }

      return res.json({
        success: true,
        message: `Schema setup complete: ${successCount} statements executed, ${errorCount} errors`,
        details: results,
        next: {
          step1: '✅ Tables created',
          step2: 'Set GEMINI_API_KEY in Vercel env vars',
          step3: 'Visit /admin.html to log in',
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    } finally {
      client.release();
      await pool.end();
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}