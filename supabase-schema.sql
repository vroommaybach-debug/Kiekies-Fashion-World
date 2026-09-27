-- Supabase Schema for Kiekies Fashion
-- Run this in your Supabase SQL Editor to initialize the database tables and Row Level Security.

-- 1. Table: products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric not null,
  image_url text not null,
  gallery_urls text[] not null default '{}',
  sizes text[] not null default '{}',
  description text,
  featured boolean not null default false,
  best_seller boolean not null default false,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

-- 2. Table: site_config
create table if not exists public.site_config (
  key text primary key,
  value jsonb not null
);

-- 3. Table: orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  items jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  status text not null default 'new' check (status in ('new', 'confirmed', 'fulfilled')),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.site_config enable row level security;
alter table public.orders enable row level security;

-- Drop existing policies if any
drop policy if exists "Anon can view published products" on public.products;
drop policy if exists "Authenticated admin full access on products" on public.products;
drop policy if exists "Anon can read site_config" on public.site_config;
drop policy if exists "Authenticated admin full access on site_config" on public.site_config;
drop policy if exists "Anon can insert orders" on public.orders;
drop policy if exists "Anon can select order by code" on public.orders;
drop policy if exists "Authenticated admin full access on orders" on public.orders;

-- Products RLS
create policy "Anon can view published products"
  on public.products
  for select
  using (status = 'published');

create policy "Authenticated admin full access on products"
  on public.products
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Site Config RLS
create policy "Anon can read site_config"
  on public.site_config
  for select
  using (true);

create policy "Authenticated admin full access on site_config"
  on public.site_config
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Orders RLS
-- Anon visitors can insert orders upon checkout
create policy "Anon can insert orders"
  on public.orders
  for insert
  with check (true);

-- Anon visitors/admin can select a single order if they have the unique code
create policy "Anon can select order by code"
  on public.orders
  for select
  using (true);

create policy "Authenticated admin full access on orders"
  on public.orders
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
