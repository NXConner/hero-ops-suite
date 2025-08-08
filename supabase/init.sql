-- Supabase schema seed (run via Supabase SQL editor or CLI)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  job_address text,
  payload jsonb not null,
  total numeric not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.customers enable row level security;
alter table public.estimates enable row level security;

-- Policies: owner can CRUD
create policy if not exists customers_owner_rw on public.customers
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy if not exists estimates_owner_rw on public.estimates
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);