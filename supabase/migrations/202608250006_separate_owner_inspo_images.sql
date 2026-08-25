alter table public.bookings add column if not exists "adminInspoImageUrls" text[] not null default '{}';
