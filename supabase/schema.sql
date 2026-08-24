create type booking_status as enum ('pending', 'confirmed', 'declined', 'cancelled', 'completed');

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  "startingPrice" numeric(10, 2) not null default 0,
  "durationMinutes" integer not null,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  "customerUserId" uuid references auth.users(id) on delete set null,
  "customerName" text not null,
  "customerPhone" text not null,
  "customerEmail" text,
  "serviceId" uuid not null references public.services(id),
  "bookingDate" date not null,
  "startTime" time not null,
  "endTime" time not null,
  notes text,
  "inspoImageUrl" text,
  status booking_status not null default 'pending',
  "googleCalendarEventId" text,
  "createdAt" timestamptz not null default now()
);

alter table public.services enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Active services are publicly readable" on public.services;
drop policy if exists "Anyone can request a pending booking" on public.bookings;
create policy "Active services are publicly readable" on public.services for select using ("isActive" = true);
create policy "Anyone can request a pending booking" on public.bookings for insert with check (status = 'pending');

insert into public.services (name, description, "startingPrice", "durationMinutes", "isActive") values
  ('Gel-X Extensions', 'Full set of Gel-X extensions. Painting is included; allow an additional 20 minutes. Nail art and charms add approximately 30 minutes. Add-ons are £5–£12.', 30.00, 60, true),
  ('Gel on Natural Nails', 'Gel application on natural nails. Painting is included; allow an additional 20 minutes. Nail art and charms add approximately 30 minutes. Add-ons are £5–£12.', 20.00, 60, true),
  ('Refills', 'Refresh and rebalance your existing set. Appointment time to be confirmed.', 20.00, 90, true),
  ('Removal / Soak Off', 'Removal of Gel-X or gel.', 10.00, 30, true),
  ('French', 'Legacy service; use as an add-on.', 10.00, 20, false),
  ('Chrome', 'Legacy service; use as an add-on.', 10.00, 20, false),
  ('Nail Art', 'Legacy service; now offered as an add-on.', 10.00, 30, false),
  ('3D Designs', 'Legacy service; now offered as an add-on.', 12.00, 30, false),
  ('Charms', 'Legacy service; now offered as an add-on.', 5.00, 30, false);


create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin')),
  "createdAt" timestamptz not null default now()
);

alter table public.admin_users enable row level security;
drop policy if exists "Admins can read their own role" on public.admin_users;
create policy "Admins can read their own role" on public.admin_users for select to authenticated using (user_id = auth.uid());

drop policy if exists "Authenticated admins can read bookings" on public.bookings;
drop policy if exists "Authenticated admins can update bookings" on public.bookings;
create policy "Authenticated admins can read bookings" on public.bookings for select to authenticated using (exists (select 1 from public.admin_users where user_id = auth.uid() and role in ('owner', 'admin')));
create policy "Authenticated admins can update bookings" on public.bookings for update to authenticated using (exists (select 1 from public.admin_users where user_id = auth.uid() and role in ('owner', 'admin'))) with check (status in ('pending', 'confirmed', 'declined', 'cancelled', 'completed'));


insert into storage.buckets (id, name, public) values ('booking-inspo', 'booking-inspo', false) on conflict (id) do update set public = false;
drop policy if exists "Anyone can upload booking inspiration" on storage.objects;
create policy "Anyone can upload booking inspiration" on storage.objects for insert to anon, authenticated with check (bucket_id = 'booking-inspo');
drop policy if exists "Admins can view booking inspiration" on storage.objects;
create policy "Admins can view booking inspiration" on storage.objects for select to authenticated using (bucket_id = 'booking-inspo' and exists (select 1 from public.admin_users where user_id = auth.uid() and role in ('owner', 'admin')));
