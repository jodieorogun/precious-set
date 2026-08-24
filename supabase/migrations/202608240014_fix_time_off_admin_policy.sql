drop policy if exists "Admins can create blocked periods" on public.blocked_periods;
create policy "Admins can create blocked periods" on public.blocked_periods for insert to authenticated with check (exists (select 1 from public.admin_users where user_id = auth.uid() and role in ('owner', 'admin')));

drop policy if exists "Admins can update blocked periods" on public.blocked_periods;
create policy "Admins can update blocked periods" on public.blocked_periods for update to authenticated using (exists (select 1 from public.admin_users where user_id = auth.uid() and role in ('owner', 'admin'))) with check (exists (select 1 from public.admin_users where user_id = auth.uid() and role in ('owner', 'admin')));

drop policy if exists "Admins can delete blocked periods" on public.blocked_periods;
create policy "Admins can delete blocked periods" on public.blocked_periods for delete to authenticated using (exists (select 1 from public.admin_users where user_id = auth.uid() and role in ('owner', 'admin')));
