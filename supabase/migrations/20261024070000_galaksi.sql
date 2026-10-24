create view public.v_galaksi_po with (security_invoker = true) as
select
  p.po_name,
  count(o.uuid) filter (where o.subtype_key = 'AO') as ao,
  count(o.uuid) filter (where o.subtype_key = 'SO') as so,
  count(o.uuid) filter (where o.subtype_key = 'DO') as do,
  count(o.uuid) filter (where o.subtype_key = 'MO') as mo,
  count(o.uuid) filter (where o.subtype_key = 'RO') as ro
from public.po_contacts p
left join public.orders o
  on o.pic_key = upper(regexp_replace(trim(coalesce(p.po_name, '')), '\s+', ' ', 'g'))
 and o.kategori_key = 'INPROCESS'
 and o.umur_order > 60
where nullif(trim(coalesce(p.po_name, '')), '') is not null
group by p.ctid, p.po_name
order by p.ctid;