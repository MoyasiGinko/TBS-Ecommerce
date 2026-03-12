create extension if not exists pgcrypto;

create table if not exists public.categories (
  id bigint generated always as identity primary key,
  title text not null,
  img text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id bigint generated always as identity primary key,
  title text not null,
  reviews int not null default 0,
  price numeric(10,2) not null,
  discounted_price numeric(10,2) not null,
  thumbnails text[] not null default '{}',
  previews text[] not null default '{}',
  details jsonb not null default '{}'::jsonb,
  category_id bigint references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_detail_enums (
  id bigint generated always as identity primary key,
  enum_group text not null check (enum_group in ('optionsGroup1', 'optionsGroup2', 'optionsGroup3', 'colors', 'gender')),
  option_id text not null,
  option_title text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (enum_group, option_id)
);

alter table if exists public.product_detail_enums
  add column if not exists option_id text;

alter table if exists public.product_detail_enums
  add column if not exists option_title text;

alter table if exists public.product_detail_enums
  add column if not exists sort_order int not null default 0;

alter table if exists public.product_detail_enums
  drop constraint if exists product_detail_enums_enum_group_check;

alter table if exists public.product_detail_enums
  add constraint product_detail_enums_enum_group_check
  check (enum_group in ('optionsGroup1', 'optionsGroup2', 'optionsGroup3', 'colors', 'gender'));

update public.product_detail_enums
set
  option_id = coalesce(option_id, lower(regexp_replace(coalesce(name, ''), '[^a-z0-9]+', '-', 'g'))),
  option_title = coalesce(option_title, name)
where option_id is null or option_title is null;

alter table if exists public.product_detail_enums
  alter column option_id set not null;

alter table if exists public.product_detail_enums
  alter column option_title set not null;

alter table if exists public.product_detail_enums
  drop column if exists name;

alter table if exists public.product_detail_enums
  drop column if exists options;

alter table if exists public.product_detail_enums
  drop constraint if exists product_detail_enums_enum_group_name_key;

alter table if exists public.product_detail_enums
  drop constraint if exists product_detail_enums_enum_group_option_id_key;

alter table if exists public.product_detail_enums
  add constraint product_detail_enums_enum_group_option_id_key
  unique (enum_group, option_id);

alter table if exists public.products
  add column if not exists details jsonb not null default '{}'::jsonb;

create table if not exists public.blogs (
  id bigint generated always as identity primary key,
  title text not null,
  date text not null,
  views int not null default 0,
  img text not null,
  content text,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id bigint generated always as identity primary key,
  review text not null,
  author_name text not null,
  author_role text not null,
  author_img text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id bigint generated always as identity primary key,
  key text not null unique,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'customer' check (role in ('admin', 'manager', 'customer')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null,
  created_at timestamptz not null default now(),
  created_at_label text not null,
  status text not null check (status in ('processing', 'delivered', 'on-hold')),
  total text not null,
  title text not null
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_detail_enums enable row level security;
alter table public.blogs enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_content enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
on public.categories for select using (true);

drop policy if exists "Public read products" on public.products;
create policy "Public read products"
on public.products for select using (true);

drop policy if exists "Public read product detail enums" on public.product_detail_enums;
create policy "Public read product detail enums"
on public.product_detail_enums for select using (true);

drop policy if exists "Public read blogs" on public.blogs;
create policy "Public read blogs"
on public.blogs for select using (true);

drop policy if exists "Public read testimonials" on public.testimonials;
create policy "Public read testimonials"
on public.testimonials for select using (true);

drop policy if exists "Public read site content" on public.site_content;
create policy "Public read site content"
on public.site_content for select using (true);

drop policy if exists "User can read own profile" on public.profiles;
create policy "User can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "User can update own profile" on public.profiles;
create policy "User can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "User can read own orders" on public.orders;
create policy "User can read own orders"
on public.orders for select
using (auth.uid() = user_id);

drop policy if exists "User can create own orders" on public.orders;
create policy "User can create own orders"
on public.orders for insert
with check (auth.uid() = user_id);

-- Helper: reads the current user's role bypassing RLS (security definer) to avoid
-- infinite recursion when this function is used inside policies on the profiles table.
drop function if exists public.get_my_profile_role() cascade;
create or replace function public.get_my_profile_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'customer'
  )
$$;

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
on public.categories for all
using (public.get_my_profile_role() in ('admin', 'manager'))
with check (public.get_my_profile_role() in ('admin', 'manager'));

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products for all
using (public.get_my_profile_role() in ('admin', 'manager'))
with check (public.get_my_profile_role() in ('admin', 'manager'));

drop policy if exists "Admins manage product detail enums" on public.product_detail_enums;
create policy "Admins manage product detail enums"
on public.product_detail_enums for all
using (public.get_my_profile_role() in ('admin', 'manager'))
with check (public.get_my_profile_role() in ('admin', 'manager'));

drop policy if exists "Admins manage blogs" on public.blogs;
create policy "Admins manage blogs"
on public.blogs for all
using (public.get_my_profile_role() in ('admin', 'manager'))
with check (public.get_my_profile_role() in ('admin', 'manager'));

drop policy if exists "Admins manage testimonials" on public.testimonials;
create policy "Admins manage testimonials"
on public.testimonials for all
using (public.get_my_profile_role() in ('admin', 'manager'))
with check (public.get_my_profile_role() in ('admin', 'manager'));

drop policy if exists "Admins manage site content" on public.site_content;
create policy "Admins manage site content"
on public.site_content for all
using (public.get_my_profile_role() in ('admin', 'manager'))
with check (public.get_my_profile_role() in ('admin', 'manager'));

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
on public.profiles for all
using (public.get_my_profile_role() in ('admin', 'manager'))
with check (public.get_my_profile_role() in ('admin', 'manager'));

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders"
on public.orders for all
using (public.get_my_profile_role() in ('admin', 'manager'))
with check (public.get_my_profile_role() in ('admin', 'manager'));
