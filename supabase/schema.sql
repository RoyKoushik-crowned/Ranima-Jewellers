-- Ranima Jewellers initial Supabase schema
-- Run in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create type public.availability_status as enum (
  'AVAILABLE',
  'RESERVED',
  'SOLD',
  'MADE_TO_ORDER',
  'ARCHIVED'
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  sort_order integer default 0,
  active boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category_id uuid references public.categories(id),
  description text,
  metal text not null check (metal in ('gold','silver')),
  purity text not null,
  gold_weight numeric(10,3),
  gross_weight numeric(10,3),
  stone_weight numeric(10,3),
  stone_unit text,
  stone_type text,
  size text,
  huid text,
  hallmark_status text,
  modification_available boolean not null default false,
  availability public.availability_status not null default 'AVAILABLE',
  featured boolean not null default false,
  additional_charges numeric(12,2) not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.metal_rates (
  id uuid primary key default gen_random_uuid(),
  metal text not null,
  purity text not null,
  rate_per_gram numeric(12,2) not null,
  currency text not null default 'INR',
  source text not null,
  source_reference text,
  effective_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pricing_settings (
  id uuid primary key default gen_random_uuid(),
  gold_making_percentage numeric(7,5) not null default 0.10,
  lightweight_threshold numeric(7,3) not null default 1.0,
  lightweight_making_percentage numeric(5,4) not null default 0.10,
  gold_gst_percentage numeric(7,5) not null default 0.03,
  making_gst_percentage numeric(7,5) not null default 0.03,
  active_from timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.price_snapshots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  rate_id uuid references public.metal_rates(id),
  gold_value numeric(12,2) not null,
  making_charge numeric(12,2) not null,
  gold_gst numeric(12,2) not null,
  making_gst numeric(12,2) not null,
  additional_charges numeric(12,2) not null default 0,
  final_price numeric(12,2) not null,
  calculated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  display_name text,
  role text not null default 'owner' check (role in ('owner','admin')),
  created_at timestamptz not null default now()
);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Basic RLS: public catalogue is readable, mutations require authenticated users.
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.metal_rates enable row level security;
alter table public.pricing_settings enable row level security;
alter table public.price_snapshots enable row level security;
alter table public.audit_logs enable row level security;
alter table public.admin_users enable row level security;

create policy "public can read active categories"
on public.categories for select using (active = true);

create policy "public can read non archived products"
on public.products for select using (archived = false);

create policy "public can read product images"
on public.product_images for select using (true);

create policy "public can read rates"
on public.metal_rates for select using (true);

create policy "public can read current pricing settings"
on public.pricing_settings for select using (true);

create policy "authenticated can manage categories"
on public.categories for all to authenticated using (true) with check (true);

create policy "authenticated can manage products"
on public.products for all to authenticated using (true) with check (true);

create policy "authenticated can manage images"
on public.product_images for all to authenticated using (true) with check (true);

create policy "authenticated can manage rates"
on public.metal_rates for all to authenticated using (true) with check (true);

create policy "authenticated can manage pricing settings"
on public.pricing_settings for all to authenticated using (true) with check (true);

create policy "authenticated can manage snapshots"
on public.price_snapshots for all to authenticated using (true) with check (true);

create policy "authenticated can manage audit logs"
on public.audit_logs for all to authenticated using (true) with check (true);

create policy "admins can read own admin profile"
on public.admin_users for select to authenticated using (auth.uid() = id);

-- Seed categories
insert into public.categories (name, slug, sort_order) values
('Rings','rings',1),
('Earrings','earrings',2),
('Necklaces','necklaces',3),
('Chains','chains',4),
('Bangles','bangles',5),
('Bracelets','bracelets',6),
('Mangalsutra','mangalsutra',7),
('Nose Pins','nose-pins',8),
('Silver','silver',9),
('Coins & Bars','coins',10)
on conflict (slug) do nothing;

insert into public.pricing_settings (
  gold_making_percentage,
  lightweight_threshold,
  lightweight_making_percentage,
  gold_gst_percentage,
  making_gst_percentage
)
select 0.10, 1.0, 0.10, 0.03, 0.03
where not exists (select 1 from public.pricing_settings);
