create table public.orders (
  uuid text primary key,
  nipnas text,
  standard_name text,
  order_id text,
  order_subtype text,
  order_subtype2 text,
  li_sid text,
  sid text,
  segmen text,
  sub_segmen text,
  custaccntname text,
  bill_region text,
  bill_witel text,
  li_product_name text,
  is_nonconn text,
  li_billdate text,
  li_milestone text,
  kategori text,
  li_status text,
  li_status_date date,
  li_fulfillment_status text,
  revenue numeric,
  li_created_date date,
  order_createdby_name text,
  action_cd text,
  kategori_umur text,
  umur_order integer,
  pic text,
  kategori_umur2 text,
  nama_mitra text,
  new_witel text,
  status text,
  notes text,
  log text,
  fingerprint text,
  sheet_row integer not null,
  sync_id uuid not null,
  synced_at timestamptz not null default now()
);

create index orders_new_witel_idx on public.orders (new_witel);
create index orders_kategori_idx on public.orders (kategori);
create index orders_pic_idx on public.orders (pic);
create index orders_sync_id_idx on public.orders (sync_id);

create table public.po_contacts (
  id bigint generated always as identity primary key,
  po_name text,
  data jsonb not null,
  sync_id uuid not null,
  synced_at timestamptz not null default now()
);

create index po_contacts_sync_id_idx on public.po_contacts (sync_id);

create table public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  dataset text not null,
  status text not null check (status in ('running', 'ok', 'failed')),
  rows integer,
  deleted integer,
  skipped integer,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index sync_runs_dataset_started_idx on public.sync_runs (dataset, started_at desc);

-- RLS on, no policies: only the API (service role) can read or write.
alter table public.orders enable row level security;
alter table public.po_contacts enable row level security;
alter table public.sync_runs enable row level security;

create view public.v_status_by_witel with (security_invoker = true) as
select
  new_witel,
  count(*) filter (where kategori = 'IN PROCESS' and status = 'Lanjut') as lanjut,
  count(*) filter (where kategori = 'IN PROCESS' and status = 'Cancel') as cancel,
  count(*) filter (where kategori = 'IN PROCESS' and status = 'Bukan Order Reg') as bukan_order_reg,
  count(*) filter (
    where kategori = 'IN PROCESS'
      and (status is null or status not in ('Lanjut', 'Cancel', 'Bukan Order Reg'))
  ) as no_status
from public.orders
where new_witel is not null
group by new_witel;

create view public.v_subtype_revenue_by_witel with (security_invoker = true) as
select
  new_witel,
  coalesce(sum(revenue) filter (where st = 'new_install'), 0) as new_install,
  coalesce(sum(revenue) filter (where st = 'modify'), 0) as modify,
  coalesce(sum(revenue) filter (where st = 'suspend'), 0) as suspend,
  coalesce(sum(revenue) filter (where st = 'disconnect'), 0) as disconnect,
  coalesce(sum(revenue) filter (where st = 'upgrade'), 0) as upgrade,
  coalesce(sum(revenue) filter (where st = 'downgrade'), 0) as downgrade,
  coalesce(sum(revenue) filter (
    where st is null
      or st not in ('new_install', 'modify', 'suspend', 'disconnect', 'upgrade', 'downgrade')
  ), 0) as other
from (
  select new_witel, revenue,
         lower(regexp_replace(trim(order_subtype), '\s+', '_', 'g')) as st
  from public.orders
  where new_witel is not null
) t
group by new_witel;

create view public.v_segmen_by_witel with (security_invoker = true) as
select new_witel, segmen, count(*) as quantity
from public.orders
where new_witel is not null and segmen is not null
group by new_witel, segmen;

create view public.v_segmen_subtype2 with (security_invoker = true) as
select
  new_witel,
  order_subtype2 as sub_type2,
  segmen,
  count(*) as quantity,
  coalesce(sum(revenue), 0) as revenue
from public.orders
where new_witel is not null and order_subtype2 is not null and segmen is not null
group by new_witel, order_subtype2, segmen;

create view public.v_order_subtype2_by_witel with (security_invoker = true) as
select
  new_witel,
  count(*) filter (where s = 'ao') as ao,
  count(*) filter (where s = 'so') as so,
  count(*) filter (where s = 'do') as "do",
  count(*) filter (where s = 'mo') as mo,
  count(*) filter (where s = 'ro') as ro
from (
  select new_witel, lower(trim(order_subtype2)) as s
  from public.orders
  where new_witel is not null and order_subtype2 is not null
) t
group by new_witel;

create view public.v_segmen_simplified with (security_invoker = true) as
select
  new_witel,
  count(*) filter (where s = 'state-owned enterprise service') as state_owned_enterprise_service,
  count(*) filter (where s = 'government') as government,
  count(*) filter (where s = 'regional') as regional,
  count(*) filter (where s = 'private service') as private_service,
  count(*) filter (where s = 'enterprise') as enterprise
from (
  select new_witel, lower(trim(segmen)) as s
  from public.orders
  where new_witel is not null and segmen is not null
) t
group by new_witel;

create view public.v_kategori_simplified with (security_invoker = true) as
select
  new_witel,
  count(*) filter (where k = 'billing completed') as billing_completed,
  count(*) filter (where k = 'in process') as in_process,
  count(*) filter (where k = 'prov. complete') as prov_complete,
  count(*) filter (where k = 'provide order') as provide_order,
  count(*) filter (where k = 'ready to bill') as ready_to_bill
from (
  select new_witel, lower(trim(kategori)) as k
  from public.orders
  where new_witel is not null and kategori is not null
) t
group by new_witel;