-- Restaurant DineFlow - Supabase schema
-- Run this in Supabase Dashboard > SQL Editor, then refresh the app.
-- The frontend stores each tenant record as JSONB for fast SaaS onboarding.

create extension if not exists pgcrypto;

create table if not exists public.dineflow_records (
  id text primary key,
  record_type text not null check (record_type in (
    'restaurant','staff','table','room','villa','menuItem','guest','booking','order','review','printJob','pushToken','plan','storeDepartment','inventoryItem','vendor','purchase','stockIssue','wastage','recipe','eventEnquiry','shiftClose','purchaseOrder','stockAudit','systemSetting','supportTicket','pushToken','plan','pushToken'
  )),
  restaurant_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dineflow_records_type on public.dineflow_records(record_type);
create index if not exists idx_dineflow_records_restaurant on public.dineflow_records(restaurant_id);
create index if not exists idx_dineflow_records_data_gin on public.dineflow_records using gin(data);

create or replace function public.set_dineflow_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_dineflow_updated_at on public.dineflow_records;
create trigger trg_dineflow_updated_at
before update on public.dineflow_records
for each row execute function public.set_dineflow_updated_at();

alter table public.dineflow_records enable row level security;

-- Public anon policies for this no-backend Vite SaaS build.
-- For production hardening, replace these with Supabase Auth/JWT tenant policies.
drop policy if exists "dineflow_public_read" on public.dineflow_records;
drop policy if exists "dineflow_public_insert" on public.dineflow_records;
drop policy if exists "dineflow_public_update" on public.dineflow_records;
drop policy if exists "dineflow_public_delete" on public.dineflow_records;

create policy "dineflow_public_read" on public.dineflow_records
for select to anon using (true);

create policy "dineflow_public_insert" on public.dineflow_records
for insert to anon with check (true);

create policy "dineflow_public_update" on public.dineflow_records
for update to anon using (true) with check (true);

create policy "dineflow_public_delete" on public.dineflow_records
for delete to anon using (true);

-- Optional: demo data can be created from the app automatically in localStorage.
-- Super Admin login is enforced in frontend as requested:
-- Email: ak38237@gmail.com / Password: 9958269235

-- If your project already had the older check constraint, run this migration too:
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'dineflow_records_record_type_check') then
    alter table public.dineflow_records drop constraint dineflow_records_record_type_check;
    alter table public.dineflow_records add constraint dineflow_records_record_type_check check (record_type in (
      'restaurant','staff','table','room','villa','menuItem','guest','booking','order','review','printJob','pushToken','plan','storeDepartment','inventoryItem','vendor','purchase','stockIssue','wastage','recipe','eventEnquiry','shiftClose','purchaseOrder','stockAudit','systemSetting','supportTicket','pushToken','plan','pushToken'
    ));
  end if;
end $$;
