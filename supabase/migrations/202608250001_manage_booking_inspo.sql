create or replace function public.get_booking_by_manage_token(token_hash text)
returns table ("bookingId" uuid, "customerName" text, "serviceName" text, "bookingDate" date, "startTime" time, "endTime" time, status booking_status, "startingPrice" numeric, "inspoImageUrl" text)
language sql security definer set search_path = public
as $$
  select b.id, b."customerName", s.name, b."bookingDate", b."startTime", b."endTime", b.status, s."startingPrice", b."inspoImageUrl"
  from public.bookings b join public.services s on s.id = b."serviceId"
  where b."manageTokenHash" = token_hash or token_hash = any(b."manageTokenHashes");
$$;

create or replace function public.update_booking_inspo_by_manage_token(token_hash text, image_path text)
returns void language plpgsql security definer set search_path = public
as $$
declare booking_record public.bookings%rowtype;
begin
  select * into booking_record from public.bookings where "manageTokenHash" = token_hash or token_hash = any("manageTokenHashes") for update;
  if not found then raise exception 'This booking link is invalid or has expired.'; end if;
  if booking_record.status not in ('pending', 'confirmed') then raise exception 'This appointment cannot be updated online.'; end if;
  if booking_record."bookingDate" + booking_record."startTime" < ((now() at time zone 'Europe/London') + interval '24 hours') then raise exception 'Images can only be added at least 24 hours before the appointment.'; end if;
  update public.bookings set "inspoImageUrl" = image_path where id = booking_record.id;
end;
$$;

grant execute on function public.update_booking_inspo_by_manage_token(text, text) to anon, authenticated;
