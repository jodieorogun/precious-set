alter table public.bookings add column if not exists "manageTokenHashes" text[] not null default '{}';

update public.bookings
set "manageTokenHashes" = array["manageTokenHash"]
where "manageTokenHash" is not null and coalesce(cardinality("manageTokenHashes"), 0) = 0;

create or replace function public.get_booking_by_manage_token(token_hash text)
returns table ("bookingId" uuid, "customerName" text, "serviceName" text, "bookingDate" date, "startTime" time, "endTime" time, status booking_status, "startingPrice" numeric)
language sql security definer set search_path = public
as $$
  select b.id, b."customerName", s.name, b."bookingDate", b."startTime", b."endTime", b.status, s."startingPrice"
  from public.bookings b join public.services s on s.id = b."serviceId"
  where b."manageTokenHash" = token_hash or token_hash = any(b."manageTokenHashes");
$$;

create or replace function public.cancel_booking_by_manage_token(token_hash text)
returns void language plpgsql security definer set search_path = public
as $$
declare booking_record public.bookings%rowtype;
begin
  select * into booking_record from public.bookings where "manageTokenHash" = token_hash or token_hash = any("manageTokenHashes") for update;
  if not found then raise exception 'This booking link is invalid or has expired.'; end if;
  if booking_record.status not in ('pending', 'confirmed') then raise exception 'This appointment cannot be cancelled online.'; end if;
  if (booking_record."bookingDate" + booking_record."startTime") < ((now() at time zone 'Europe/London') + interval '24 hours') then raise exception 'Online cancellations must be made at least 24 hours before the appointment.'; end if;
  update public.bookings set status = 'cancelled' where id = booking_record.id;
end;
$$;

create or replace function public.request_booking_change_by_manage_token(token_hash text, requested_date date, requested_start time, requested_end time)
returns void language plpgsql security definer set search_path = public
as $$
declare booking_record public.bookings%rowtype;
begin
  select * into booking_record from public.bookings where "manageTokenHash" = token_hash or token_hash = any("manageTokenHashes") for update;
  if not found then raise exception 'This booking link is invalid or has expired.'; end if;
  if booking_record.status not in ('pending', 'confirmed') then raise exception 'This appointment cannot be changed online.'; end if;
  if booking_record."bookingDate" + booking_record."startTime" < ((now() at time zone 'Europe/London') + interval '24 hours') then raise exception 'Changes must be requested at least 24 hours before the appointment.'; end if;
  if requested_date + requested_start < ((now() at time zone 'Europe/London') + interval '24 hours') then raise exception 'The new appointment must also be at least 24 hours away.'; end if;
  if requested_end <= requested_start then raise exception 'The end time must be after the start time.'; end if;
  if booking_record.status = 'pending' then
    update public.bookings set "bookingDate" = requested_date, "startTime" = requested_start, "endTime" = requested_end, "changeRequestDate" = null, "changeRequestStartTime" = null, "changeRequestEndTime" = null, "changeRequestStatus" = null where id = booking_record.id;
  else
    update public.bookings set "changeRequestDate" = requested_date, "changeRequestStartTime" = requested_start, "changeRequestEndTime" = requested_end, "changeRequestStatus" = 'submitted' where id = booking_record.id;
  end if;
end;
$$;

grant execute on function public.get_booking_by_manage_token(text) to anon, authenticated;
grant execute on function public.cancel_booking_by_manage_token(text) to anon, authenticated;
grant execute on function public.request_booking_change_by_manage_token(text, date, time, time) to anon, authenticated;
