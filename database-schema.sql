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
  payment_intent_id text -- For PayFast/Stripe integration
);

-- Trigger to update spots when booking is confirmed
create or replace function update_event_spots() returns trigger as $$
begin
  if NEW.status = 'Paid' or NEW.status = 'Free' then
    update public.events
    set spots_left = spots_left - NEW.guests,
        updated_at = timezone('utc'::text, now())
    where id = NEW.event_id
    and spots_left >= NEW.guests; -- Prevent overbooking

    -- If we couldn't update (overbooked), mark as error
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
$$ language plpgsql;

-- Create trigger
create trigger trigger_update_spots
  after insert or update on public.bookings
  for each row execute procedure update_event_spots();

-- Reservation expiry cleanup (run via cron or manually)
-- This should run every 5 minutes
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

-- RLS Policies (basic - adjust as needed)

-- Users: Can read/write own profile
create policy "users_can_crud_own" on public.users
  for all using (auth.uid() = id);

-- Events: Public read access
create policy "events_public_read" on public.events
  for select using (true);

-- Events: Only admins can write (adjust policy for your admin setup)
create policy "events_admin_write" on public.events
  for all using (auth.uid() in (select id from public.users where email in ('admin@youremmail.com')));

-- Bookings: Users can read/write own bookings
create policy "bookings_own_only" on public.bookings
  for all using (auth.uid() = user_id);

-- Reservations: Users can manage own reservations
create policy "reservations_own_only" on public.booking_reservations
  for all using (auth.uid() = user_id);