alter table public.bookings add column if not exists "manageTokenHash" text unique;

create or replace function public.get_booking_by_manage_token(token_hash text)
returns table ("bookingId" uuid, "customerName" text, "serviceName" text, "bookingDate" date, "startTime" time, "endTime" time, status booking_status, "startingPrice" numeric)
language sql security definer set search_path = public
as $$
  select b.id, b."customerName", s.name, b."bookingDate", b."startTime", b."endTime", b.status, s."startingPrice"
  from public.bookings b join public.services s on s.id = b."serviceId"
  where b."manageTokenHash" = token_hash;
$$;

create or replace function public.cancel_booking_by_manage_token(token_hash text)
returns void language plpgsql security definer set search_path = public
as $$
declare booking_record public.bookings%rowtype;
begin
  select * into booking_record from public.bookings where "manageTokenHash" = token_hash for update;
  if not found then raise exception 'This booking link is invalid or has expired.'; end if;
  if booking_record.status not in ('pending', 'confirmed') then raise exception 'This appointment cannot be cancelled online.'; end if;
  if (booking_record."bookingDate" + booking_record."startTime") < ((now() at time zone 'Europe/London') + interval '24 hours') then raise exception 'Online cancellations must be made at least 24 hours before the appointment.'; end if;
  update public.bookings set status = 'cancelled' where id = booking_record.id;
end;
$$;

grant execute on function public.get_booking_by_manage_token(text) to anon, authenticated;
grant execute on function public.cancel_booking_by_manage_token(text) to anon, authenticated;
