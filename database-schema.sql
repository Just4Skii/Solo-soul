-- ============================================================
-- Solo Soul Experiences - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends auth.users)
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Booking reservations (temporary holds before payment)
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
  payment_intent_id text -- For Paystack integration
);

-- Trigger to update spots when booking is confirmed
create or replace function public.update_event_spots() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT' and NEW.status in ('Paid', 'Free'))
     or (TG_OP = 'UPDATE' and OLD.status not in ('Paid', 'Free') and NEW.status in ('Paid', 'Free')) then
    update public.events
    set spots_left = spots_left - NEW.guests,
        updated_at = timezone('utc'::text, now())
    where id = NEW.event_id
    and spots_left >= NEW.guests; -- Prevent overbooking

    -- If we couldn't update (overbooked), mark as error
    if not found then
      raise exception 'Not enough spots available for event %', NEW.event_id;
    end if;
  elsif TG_OP = 'UPDATE'
        and OLD.status in ('Paid', 'Free')
        and NEW.status in ('Cancelled', 'Refunded') then
    update public.events
    set spots_left = least(spots_total, spots_left + NEW.guests),
        updated_at = timezone('utc'::text, now())
    where id = NEW.event_id;
  end if;
  return NEW;
end;
$$;

-- Create trigger
drop trigger if exists trigger_update_spots on public.bookings;
create trigger trigger_update_spots
  after insert or update on public.bookings
  for each row execute procedure public.update_event_spots();

-- Reservation expiry cleanup (run via cron or manually)
create or replace function cleanup_expired_reservations() returns void as $$
begin
  delete from public.booking_reservations
  where expires_at < timezone('utc'::text, now());
end;
$$ language plpgsql;

-- Indexes for performance
create index if not exists idx_events_date on public.events(date);
create index if not exists idx_events_active on public.events(active);
create index if not exists idx_events_category on public.events(category);
create index if not exists idx_bookings_user on public.bookings(user_id);
create index if not exists idx_bookings_event on public.bookings(event_id);
create index if not exists idx_reservations_expires on public.booking_reservations(expires_at);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_reservations enable row level security;

-- RLS Policies (Hardened: all privileged mutations run through service-role APIs)

-- Users: Can read and update only their own profile with their verified auth email
drop policy if exists "users_can_crud_own" on public.users;
drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_insert_own" on public.users
  for insert with check (
    auth.uid() = id
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
create policy "users_update_own" on public.users
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Events: Public read access for active events only; writes restricted to service_role
drop policy if exists "events_public_read" on public.events;
drop policy if exists "events_admin_write" on public.events;
create policy "events_public_read" on public.events
  for select using (active = true);

-- Bookings: Users can read their own bookings; all inserts/updates happen server-side via service_role
drop policy if exists "bookings_own_only" on public.bookings;
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own" on public.bookings
  for select using (auth.uid() = user_id);

-- Reservations: Users can read their own reservations
drop policy if exists "reservations_own_only" on public.booking_reservations;
drop policy if exists "reservations_select_own" on public.booking_reservations;
create policy "reservations_select_own" on public.booking_reservations
  for select using (auth.uid() = user_id);

-- ============================================================
-- ADMIN SYSTEM
-- ============================================================

-- Admin users table (separate from regular users for better security)
create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  role text not null default 'admin' check (role in ('admin', 'superadmin')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  last_login timestamp with time zone
);

-- Enable RLS on admin_users (no public/client policies — service_role only)
alter table public.admin_users enable row level security;
drop policy if exists "admin_users_self_only" on public.admin_users;

-- ============================================================
-- TICKET VERIFICATION SYSTEM (Gemini-powered)
-- ============================================================

-- Ticket verifications (cached from Gemini checks)
create table if not exists public.ticket_verifications (
  id uuid primary key default uuid_generate_v4(),
  event_title text not null,
  source_url text not null,
  status text not null check (status in ('verified', 'dead', 'redirected')),
  suggested_url text,
  checked_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.ticket_verifications enable row level security;
drop policy if exists "ticket_verifications_public_read" on public.ticket_verifications;
create policy "ticket_verifications_public_read" on public.ticket_verifications
  for select using (true);

-- Index for quick lookups
create index if not exists idx_ticket_verifications_title on public.ticket_verifications(event_title);
create index if not exists idx_ticket_verifications_checked on public.ticket_verifications(checked_at);

-- ============================================================
-- EVENT IMAGES & ENHANCEMENTS
-- ============================================================

-- Add new columns to events table (if not already present)
-- Image stored in Supabase Storage bucket 'event-images'
alter table public.events add column if not exists image_url text;
alter table public.events add column if not exists description text;
alter table public.events add column if not exists is_featured boolean default false;
alter table public.events add column if not exists updated_by uuid references public.admin_users(id);
