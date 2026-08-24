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
  "customerName" text not null,
  "customerPhone" text not null,
  "customerEmail" text,
  "serviceId" uuid not null references public.services(id),
  "bookingDate" date not null,
  "startTime" time not null,
  "endTime" time not null,
  notes text,
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
  ('Gel-X / Extensions', 'Lightweight extensions with a clean, polished finish.', 45.00, 120, true),
  ('Gel on Natural Nails', 'A durable gel finish on your natural nails.', 30.00, 90, true),
  ('Infills', 'Refresh and rebalance your existing enhancement set.', 35.00, 90, true),
  ('Removals', 'Safe, careful removal of an existing set.', 15.00, 45, true),
  ('French', 'A classic French finish with a crisp, delicate detail.', 10.00, 20, true),
  ('Chrome', 'A reflective chrome finish for a little extra shine.', 10.00, 20, true),
  ('Nail Art', 'Custom hand-painted details tailored to your set.', 15.00, 30, true),
  ('3D Designs', 'Raised, sculptural nail art for a statement finish.', 20.00, 30, true),
  ('Charms', 'A curated charm detail to make your set feel yours.', 8.00, 15, true);
