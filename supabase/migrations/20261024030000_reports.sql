alter table public.orders
  add column kategori_key text generated always as
    (upper(regexp_replace(coalesce(kategori, ''), '\s+', '', 'g'))) stored,
  add column umur_key text generated always as
    (upper(regexp_replace(coalesce(kategori_umur, ''), '\s+', '', 'g'))) stored,
  add column pic_key text generated always as
    (upper(regexp_replace(trim(coalesce(pic, '')), '\s+', ' ', 'g'))) stored;

create index orders_kategori_key_idx on public.orders (kategori_key);
create index orders_pic_key_idx on public.orders (pic_key);

alter table public.po_contacts
  add column po_email text generated always as
    (lower(trim(coalesce(data ->> 'PO_EMAIL', '')))) stored;

create index po_contacts_po_email_idx on public.po_contacts (po_email);

create view public.v_report_witel_kategori with (security_invoker = true) as
select
  new_witel,
  kategori,
  count(*) filter (where bucket = 'lt2') as lt2_count,
  coalesce(sum(revenue) filter (where bucket = 'lt2'), 0) as lt2_revenue,
  count(*) filter (where bucket = 'gt2') as gt2_count,
  coalesce(sum(revenue) filter (where bucket = 'gt2'), 0) as gt2_revenue,
  count(*) filter (where warning) as warning_count,
  coalesce(sum(revenue) filter (where warning), 0) as warning_revenue
from (
  select
    new_witel,
    kategori,
    revenue,
    case
      when kategori_key = 'INPROCESS' then
        case when coalesce(umur_order, 0) > 60 then 'gt2' else 'lt2' end
      when umur_key = '<2BLN' then 'lt2'
      when umur_key = '>2BLN' then 'gt2'
    end as bucket,
    (kategori_key = 'INPROCESS' and coalesce(umur_order, 0) between 20 and 60) as warning
  from public.orders
  where new_witel is not null and kategori is not null
) t
group by new_witel, kategori;

create view public.v_alert_by_pic with (security_invoker = true) as
select
  coalesce(nullif(trim(pic), ''), 'UNKNOWN') as pic,
  coalesce(nullif(trim(new_witel), ''), '-') as witel,
  coalesce(nullif(trim(status), ''), 'No Status') as status,
  count(*) as quantity
from public.orders
where kategori_key = 'INPROCESS' and coalesce(umur_order, 0) between 20 and 60
group by 1, 2, 3;

create function public.pic_summary(p_pic_key text, p_only_warning boolean default false)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with m as (
    select kategori, umur_key, revenue
    from public.orders
    where pic_key = p_pic_key
      and (
        not p_only_warning
        or (kategori_key = 'INPROCESS' and coalesce(umur_order, 0) between 20 and 60)
      )
  )
  select jsonb_build_object(
    'total_orders', (select count(*) from m),
    'total_revenue', (select round(coalesce(sum(revenue), 0)) from m),
    'by_kategori', coalesce(
      (select jsonb_object_agg(k, c)
       from (select coalesce(kategori, 'UNKNOWN') as k, count(*) as c from m group by 1) x),
      '{}'::jsonb
    ),
    'lt2', (
      select jsonb_build_object('count', count(*), 'revenue', round(coalesce(sum(revenue), 0)))
      from m where umur_key = '<2BLN'
    ),
    'gt2', (
      select jsonb_build_object('count', count(*), 'revenue', round(coalesce(sum(revenue), 0)))
      from m where umur_key = '>2BLN'
    )
  )
$$;

revoke execute on function public.pic_summary(text, boolean) from public, anon, authenticated;
grant execute on function public.pic_summary(text, boolean) to service_role;