alter table public.bookings add column if not exists "changeRequestDate" date;
alter table public.bookings add column if not exists "changeRequestStartTime" time;
alter table public.bookings add column if not exists "changeRequestEndTime" time;
alter table public.bookings add column if not exists "changeRequestStatus" text;

create or replace function public.request_booking_change_by_manage_token(token_hash text, requested_date date, requested_start time, requested_end time)
returns void language plpgsql security definer set search_path = public
as $$
declare booking_record public.bookings%rowtype;
begin
  select * into booking_record from public.bookings where "manageTokenHash" = token_hash for update;
  if not found then raise exception 'This booking link is invalid or has expired.'; end if;
  if booking_record.status not in ('pending', 'confirmed') then raise exception 'This appointment cannot be changed online.'; end if;
  if (booking_record."bookingDate" + booking_record."startTime") < ((now() at time zone 'Europe/London') + interval '24 hours') then raise exception 'Changes must be requested at least 24 hours before the appointment.'; end if;
  if requested_end <= requested_start then raise exception 'The end time must be after the start time.'; end if;
  update public.bookings set "changeRequestDate" = requested_date, "changeRequestStartTime" = requested_start, "changeRequestEndTime" = requested_end, "changeRequestStatus" = 'pending' where id = booking_record.id;
end;
$$;

grant execute on function public.request_booking_change_by_manage_token(text, date, time, time) to anon, authenticated;
