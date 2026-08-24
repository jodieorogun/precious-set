alter table public.bookings add column if not exists "addOns" text[] not null default '{}';
alter table public.bookings add column if not exists "addonPrice" numeric(10, 2) not null default 0;
