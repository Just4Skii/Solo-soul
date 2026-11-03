-- ============================================================
-- Solo Soul Experiences — Security Hardening Migration (2026-11-03)
-- Remediates SSOUL-001 (RLS privilege escalation & booking forgery)
-- ============================================================

-- 1. Harden public.users RLS: prevent email spoofing (e.g. 'admin@youremmail.com')
alter table public.users enable row level security;
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

-- 2. Harden public.events RLS: remove client-side write policy (all admin writes use service_role)
alter table public.events enable row level security;
drop policy if exists "events_admin_write" on public.events;
drop policy if exists "events_public_read" on public.events;

create policy "events_public_read" on public.events
  for select using (active = true);

-- 3. Harden public.bookings RLS: read-only for booking owner; all writes via service_role APIs
alter table public.bookings enable row level security;
drop policy if exists "bookings_own_only" on public.bookings;
drop policy if exists "bookings_select_own" on public.bookings;

create policy "bookings_select_own" on public.bookings
  for select using (auth.uid() = user_id);

-- 4. Harden public.booking_reservations RLS
alter table public.booking_reservations enable row level security;
drop policy if exists "reservations_own_only" on public.booking_reservations;
drop policy if exists "reservations_select_own" on public.booking_reservations;

create policy "reservations_select_own" on public.booking_reservations
  for select using (auth.uid() = user_id);

-- 5. Lock down public.admin_users completely from PostgREST
alter table public.admin_users enable row level security;
drop policy if exists "admin_users_self_only" on public.admin_users;

-- 6. Harden public.ticket_verifications (public read, service_role write)
alter table public.ticket_verifications enable row level security;
drop policy if exists "ticket_verifications_public_read" on public.ticket_verifications;
create policy "ticket_verifications_public_read" on public.ticket_verifications
  for select using (true);

-- 7. Harden update_event_spots() trigger function
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
    and spots_left >= NEW.guests;

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
