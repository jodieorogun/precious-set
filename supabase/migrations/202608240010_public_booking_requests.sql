drop policy if exists "Verified customers can request a pending booking" on public.bookings;
drop policy if exists "Anyone can request a pending booking" on public.bookings;
create policy "Anyone can request a pending booking" on public.bookings
for insert to anon, authenticated
with check (status = 'pending');
