alter table public.opening_hours add column if not exists "breakStart" time;
alter table public.opening_hours add column if not exists "breakEnd" time;
