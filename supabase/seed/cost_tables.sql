insert into pricing_tables (region, vendor, effective_from)
values
  ('default', 'standard', current_date)
returning id;

-- Use the returned id if running manually; for idempotency, upsert by selecting the latest table id.
with latest as (
  select id from pricing_tables
  where region = 'default' and vendor = 'standard'
  order by effective_from desc
  limit 1
)
insert into pricing_items (table_id, item_code, description, unit, unit_cost)
select id, 'CRACK_SEAL', 'Crack sealing (hot-pour)', 'ft', 1.50 from latest
on conflict do nothing;

with latest as (
  select id from pricing_tables
  where region = 'default' and vendor = 'standard'
  order by effective_from desc
  limit 1
)
insert into pricing_items (table_id, item_code, description, unit, unit_cost)
select id, 'POTHOLE_PATCH', 'Pothole patch', 'sqft', 12.00 from latest
on conflict do nothing;

with latest as (
  select id from pricing_tables
  where region = 'default' and vendor = 'standard'
  order by effective_from desc
  limit 1
)
insert into pricing_items (table_id, item_code, description, unit, unit_cost)
select id, 'GATOR_REPAIR', 'Gatoring repair', 'sqft', 6.50 from latest
on conflict do nothing;

with latest as (
  select id from pricing_tables
  where region = 'default' and vendor = 'standard'
  order by effective_from desc
  limit 1
)
insert into pricing_items (table_id, item_code, description, unit, unit_cost)
select id, 'REGRADING', 'Regrading/leveling', 'sqft', 4.00 from latest
on conflict do nothing;