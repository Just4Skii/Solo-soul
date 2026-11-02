/**
 * One-time ecosystem migration endpoint.
 * Protected by SETUP_TOKEN. Uses Vercel's Postgres connection env vars.
 */
import pg from 'pg';

const SQL = `
create extension if not exists pgcrypto;

alter table public.bookings add column if not exists customer_name text;
alter table public.bookings add column if not exists ticket_code text;
alter table public.bookings add column if not exists checked_in_at timestamptz;
alter table public.bookings add column if not exists cancelled_at timestamptz;

update public.bookings set ticket_code = encode(gen_random_bytes(8), 'hex') where ticket_code is null;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  provider text not null default 'paystack',
  provider_reference text,
  amount numeric not null default 0,
  currency text not null default 'ZAR',
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','partially_refunded')),
  platform_fee numeric not null default 0,
  net_amount numeric,
  raw jsonb,
  paid_at timestamptz,
  created_at timestamptz default now()
);
create unique index if not exists payments_provider_ref_idx on public.payments(provider, provider_reference) where provider_reference is not null;
create index if not exists payments_booking_idx on public.payments(booking_id);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  amount numeric not null default 0,
  reason text not null,
  status text not null default 'requested' check (status in ('requested','approved','rejected','processing','refunded','failed')),
  requested_by uuid,
  admin_note text,
  provider_refund_ref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists refunds_booking_idx on public.refunds(booking_id);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null,
  name text,
  booking_ref text,
  category text not null default 'other' check (category in ('booking','payment','refund','experience','account','other')),
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists support_status_idx on public.support_tickets(status);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.support_tickets(id) on delete cascade,
  author_type text not null check (author_type in ('customer','admin','system')),
  author_name text,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid,
  recipient text,
  template text,
  status text not null default 'queued',
  provider_id text,
  error text,
  created_at timestamptz default now()
);

create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  provider_name text not null default 'Solo Soul Experiences',
  gross numeric not null default 0,
  platform_fee numeric not null default 0,
  provider_amount numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','paid','not_applicable')),
  reference text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.email_log enable row level security;
alter table public.settlements enable row level security;
`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const expected = process.env.SETUP_TOKEN;
  const provided = req.headers['x-setup-token'];
  if (!expected || provided !== expected) return res.status(403).json({ error: 'Forbidden' });
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) return res.status(500).json({ error: 'No Postgres connection string' });

  const parsed = new URL(connectionString);
  parsed.searchParams.delete('sslmode');
  parsed.searchParams.delete('ssl');
  const client = new pg.Client({ connectionString: parsed.toString(), ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();
    await client.query(SQL);
    const tables = await client.query("select table_name from information_schema.tables where table_schema='public' and table_name in ('payments','refunds','support_tickets','support_messages','email_log','settlements') order by 1");
    return res.status(200).json({ ok: true, tables: tables.rows.map(r => r.table_name) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  } finally {
    await client.end().catch(() => {});
  }
}
