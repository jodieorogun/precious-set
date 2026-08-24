alter table public.bookings add column if not exists "inspoImageUrl" text;

insert into storage.buckets (id, name, public)
values ('booking-inspo', 'booking-inspo', false)
on conflict (id) do update set public = false;

drop policy if exists "Anyone can upload booking inspiration" on storage.objects;
create policy "Anyone can upload booking inspiration" on storage.objects
for insert to anon, authenticated
with check (bucket_id = 'booking-inspo');

drop policy if exists "Admins can view booking inspiration" on storage.objects;
create policy "Admins can view booking inspiration" on storage.objects
for select to authenticated
using (bucket_id = 'booking-inspo' and exists (select 1 from public.admin_users where user_id = auth.uid() and role in ('owner', 'admin')));
