create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  telegram_id bigint unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, email, full_name)
select id, coalesce(email, ''), raw_user_meta_data ->> 'full_name'
from auth.users
on conflict (id) do nothing;

-- Bootstrap your first admin (replace the email, run once):
-- update public.profiles set role = 'admin' where email = 'you@example.com';