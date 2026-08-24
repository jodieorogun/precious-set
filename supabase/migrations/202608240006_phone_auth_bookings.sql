alter table public.bookings add column if not exists "customerUserId" uuid references auth.users(id) on delete set null;

drop policy if exists "Anyone can request a pending booking" on public.bookings;
create policy "Verified customers can request a pending booking" on public.bookings
for insert to authenticated
with check (status = 'pending' and "customerUserId" = auth.uid());

drop policy if exists "Customers can read their own bookings" on public.bookings;
create policy "Customers can read their own bookings" on public.bookings
for select to authenticated
using ("customerUserId" = auth.uid());
