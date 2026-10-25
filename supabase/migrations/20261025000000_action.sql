alter table public.orders
  add column status_label text generated always as (
    case lower(trim(coalesce(status, '')))
      when 'lanjut' then 'Lanjut'
      when 'cancel' then 'Cancel'
      when 'bukan order reg' then 'Bukan Order Reg'
      else 'No Status'
    end
  ) stored;

create view public.v_action_po with (security_invoker = true) as
select
  p.po_name,
  trim(coalesce(p.data ->> 'WITEL', '')) as witel,
  count(o.uuid) filter (where o.bucket = 'lt2' and o.status_label = 'Lanjut') as lt2_lanjut,
  count(o.uuid) filter (where o.bucket = 'lt2' and o.status_label = 'Cancel') as lt2_cancel,
  count(o.uuid) filter (where o.bucket = 'lt2' and o.status_label = 'Bukan Order Reg') as lt2_bukan,
  count(o.uuid) filter (where o.bucket = 'lt2' and o.status_label = 'No Status') as lt2_none,
  count(o.uuid) filter (where o.bucket = 'gt2' and o.status_label = 'Lanjut') as gt2_lanjut,
  count(o.uuid) filter (where o.bucket = 'gt2' and o.status_label = 'Cancel') as gt2_cancel,
  count(o.uuid) filter (where o.bucket = 'gt2' and o.status_label = 'Bukan Order Reg') as gt2_bukan,
  count(o.uuid) filter (where o.bucket = 'gt2' and o.status_label = 'No Status') as gt2_none
from public.po_contacts p
left join public.orders o
  on o.pic_key = upper(regexp_replace(trim(coalesce(p.po_name, '')), '\s+', ' ', 'g'))
 and o.witel_key = case
       when nullif(trim(coalesce(p.data ->> 'WITEL', '')), '') is null then 'N/A'
       else trim(p.data ->> 'WITEL')
     end
 and o.kategori_key = 'INPROCESS'
where nullif(trim(coalesce(p.po_name, '')), '') is not null
group by p.ctid, p.po_name, p.data
order by p.ctid;