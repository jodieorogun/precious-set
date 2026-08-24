alter table public.blocked_periods add column if not exists "startTime" time;
alter table public.blocked_periods add column if not exists "endTime" time;

alter table public.blocked_periods drop constraint if exists blocked_periods_time_order;
alter table public.blocked_periods add constraint blocked_periods_time_order check (
  ("startTime" is null and "endTime" is null) or
  ("startTime" is not null and "endTime" is not null and "endTime" > "startTime")
);
