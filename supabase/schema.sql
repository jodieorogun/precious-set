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

create policy "Active services are publicly readable" on public.services for select using ("isActive" = true);
