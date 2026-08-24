create table if not exists public.opening_hours (
  id uuid primary key default gen_random_uuid(),
  "dayOfWeek" integer unique not null check ("dayOfWeek" between 0 and 6),
  "isOpen" boolean not null default true,
  "openTime" time not null default '09:00',
  "closeTime" time not null default '18:00'
);

alter table public.opening_hours enable row level security;
drop policy if exists "Opening hours are publicly readable" on public.opening_hours;
create policy "Opening hours are publicly readable" on public.opening_hours for select using (true);

insert into public.opening_hours ("dayOfWeek", "isOpen", "openTime", "closeTime") values
  (0, false, '09:00', '18:00'), (1, true, '09:00', '18:00'), (2, true, '09:00', '18:00'),
  (3, true, '09:00', '18:00'), (4, true, '09:00', '18:00'), (5, true, '09:00', '18:00'),
  (6, true, '10:00', '16:00')
on conflict ("dayOfWeek") do nothing;

create or replace function public.get_booked_times(target_date date)
returns table ("startTime" time, "endTime" time)
language sql
security definer
set search_path = public
as $$
  select b."startTime", b."endTime" from public.bookings b
  where b."bookingDate" = target_date and b.status in ('pending', 'confirmed');
$$;

grant execute on function public.get_booked_times(date) to anon, authenticated;
