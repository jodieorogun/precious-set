update public.bookings
set "inspoImageUrls" = array["inspoImageUrl"]
where "inspoImageUrl" is not null
  and coalesce(cardinality("inspoImageUrls"), 0) = 0;
