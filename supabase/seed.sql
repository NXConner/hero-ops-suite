-- Example seed data
insert into public.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'owner@example.com')
  on conflict do nothing;

insert into public.customers (owner_id, name, address, phone, email)
values ('00000000-0000-0000-0000-000000000001', 'Sample Customer', '123 Main St, Stuart, VA', '555-0100', 'customer@example.com')
on conflict do nothing;