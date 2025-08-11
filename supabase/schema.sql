-- Core tables
create table if not exists clients (
  client_id uuid primary key default gen_random_uuid(),
  org text not null,
  contact jsonb,
  created_at timestamptz default now()
);

create table if not exists contractors (
  contractor_id uuid primary key default gen_random_uuid(),
  company text not null,
  contact jsonb,
  created_at timestamptz default now()
);

create table if not exists scans (
  scan_id uuid primary key default gen_random_uuid(),
  site_id uuid,
  client_id uuid references clients(client_id) on delete set null,
  timestamp timestamptz not null default now(),
  perimeter_ft numeric,
  area_sqft numeric,
  mesh_url text,
  overlay_json jsonb,
  created_by uuid,
  created_at timestamptz default now()
);

create index if not exists scans_timestamp_idx on scans(timestamp desc);

create table if not exists defects (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references scans(scan_id) on delete cascade,
  type text not null,
  geometry jsonb not null,
  length_ft numeric,
  area_sqft numeric,
  severity text,
  created_at timestamptz default now()
);

create table if not exists slope_data (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references scans(scan_id) on delete cascade,
  pooling_area_sqft numeric,
  risk_zones jsonb,
  slope_map_url text,
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references scans(scan_id) on delete cascade,
  pdf_url text not null,
  summary text,
  cost_json jsonb,
  created_at timestamptz default now()
);

create table if not exists jobs (
  job_id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(scan_id) on delete set null,
  tasks_json jsonb,
  total_estimate numeric,
  status text default 'draft',
  scheduled_date date,
  completion_date date,
  created_at timestamptz default now()
);

create index if not exists jobs_status_date_idx on jobs(status, scheduled_date);

create table if not exists invoices (
  invoice_id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(scan_id) on delete set null,
  client_id uuid references clients(client_id) on delete set null,
  total numeric not null default 0,
  due_date date,
  status text default 'draft',
  created_at timestamptz default now()
);

create index if not exists invoices_status_idx on invoices(status);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid,
  receiver_id uuid,
  scan_id uuid references scans(scan_id) on delete set null,
  message text not null,
  timestamp timestamptz default now()
);

create table if not exists files (
  file_id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(scan_id) on delete cascade,
  url text not null,
  type text not null,
  created_at timestamptz default now()
);

-- Pricing configuration
create table if not exists pricing_tables (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  vendor text,
  effective_from date not null,
  effective_to date,
  created_at timestamptz default now()
);

create table if not exists pricing_items (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references pricing_tables(id) on delete cascade,
  item_code text not null,
  description text,
  unit text not null, -- ft, sqft, ea
  unit_cost numeric not null,
  unique(table_id, item_code)
);

-- Basic roles/tenancy scaffolding (adjust to your auth model)
-- Enable RLS and add tenant scoping columns if multi-tenant (e.g., org_id uuid)
-- alter table scans enable row level security;
-- create policy "tenant_isolation" on scans
--   for all using (auth.uid() = created_by);

-- Buckets (create in Supabase UI/CLI): meshes/, raw_images/, snapshots/, tiles/, reports/