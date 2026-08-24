create or replace function public.update_booking_inspo_by_manage_token(token_hash text, image_path text)
returns void language plpgsql security definer set search_path = public
as $$
declare booking_record public.bookings%rowtype;
begin
  select * into booking_record from public.bookings where "manageTokenHash" = token_hash or token_hash = any("manageTokenHashes") for update;
  if not found then raise exception 'This booking link is invalid or has expired.'; end if;
  if booking_record.status not in ('pending', 'confirmed') then raise exception 'This appointment cannot be updated online.'; end if;
  update public.bookings set "inspoImageUrl" = image_path where id = booking_record.id;
end;
$$;
