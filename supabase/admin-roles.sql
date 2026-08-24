create table if not exists public.admin_users (
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

-- Run this after creating your user in Supabase Auth. Replace the email value.
insert into public.admin_users (user_id, role)
select id, 'owner' from auth.users where email = 'your-email@example.com'
on conflict (user_id) do update set role = excluded.role;
