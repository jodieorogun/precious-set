drop policy if exists "Admins can delete booking inspiration" on storage.objects;
create policy "Admins can delete booking inspiration" on storage.objects
for delete to authenticated
using (bucket_id = 'booking-inspo' and exists (select 1 from public.admin_users where user_id = auth.uid() and role in ('owner', 'admin')));
