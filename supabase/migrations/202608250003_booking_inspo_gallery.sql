alter table public.bookings add column if not exists "inspoImageUrls" text[] not null default '{}';
update public.bookings set "inspoImageUrls" = array["inspoImageUrl"] where "inspoImageUrl" is not null and coalesce(cardinality("inspoImageUrls"), 0) = 0;

drop function if exists public.get_booking_by_manage_token(text);
create function public.get_booking_by_manage_token(token_hash text)
returns table ("bookingId" uuid, "customerName" text, "serviceName" text, "bookingDate" date, "startTime" time, "endTime" time, status booking_status, "startingPrice" numeric, "inspoImageUrl" text, "inspoImageUrls" text[])
language sql security definer set search_path = public
as $$
  select b.id, b."customerName", s.name, b."bookingDate", b."startTime", b."endTime", b.status, s."startingPrice", b."inspoImageUrl", b."inspoImageUrls"
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
  if coalesce(cardinality(booking_record."inspoImageUrls"), 0) >= 3 then raise exception 'You can add up to 3 inspiration images.'; end if;
  update public.bookings set "inspoImageUrls" = array_append("inspoImageUrls", image_path), "inspoImageUrl" = coalesce("inspoImageUrl", image_path) where id = booking_record.id;
end;
$$;

grant execute on function public.update_booking_inspo_by_manage_token(text, text) to anon, authenticated;
