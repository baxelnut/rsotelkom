create view public.v_pic_names with (security_invoker = true) as
select distinct on (pic_key) pic, pic_key
from public.orders
where nullif(pic_key, '') is not null
order by pic_key, pic;