create table if not exists public.blocked_periods (
  id uuid primary key default gen_random_uuid(),
  "startDate" date not null,
  "endDate" date not null,
  reason text,
  "createdAt" timestamptz not null default now(),
  constraint blocked_periods_date_order check ("endDate" >= "startDate")
);

alter table public.blocked_periods enable row level security;

drop policy if exists "Anyone can view blocked periods" on public.blocked_periods;
create policy "Anyone can view blocked periods" on public.blocked_periods for select using (true);

drop policy if exists "Admins can create blocked periods" on public.blocked_periods;
create policy "Admins can create blocked periods" on public.blocked_periods for insert with check (exists (select 1 from public.admin_users where id = auth.uid() and role in ('owner', 'admin')));

drop policy if exists "Admins can update blocked periods" on public.blocked_periods;
create policy "Admins can update blocked periods" on public.blocked_periods for update using (exists (select 1 from public.admin_users where id = auth.uid() and role in ('owner', 'admin'))) with check (exists (select 1 from public.admin_users where id = auth.uid() and role in ('owner', 'admin')));

drop policy if exists "Admins can delete blocked periods" on public.blocked_periods;
create policy "Admins can delete blocked periods" on public.blocked_periods for delete using (exists (select 1 from public.admin_users where id = auth.uid() and role in ('owner', 'admin')));
