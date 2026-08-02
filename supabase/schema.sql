-- Trackdown schema
-- Run this via Supabase MCP execute_sql (not the PostgREST schema cache).

create extension if not exists "pgcrypto";

create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('tournament', 'cash')),
  down_length int not null check (down_length in (30, 40)),
  start_time timestamptz not null,
  ended_at timestamptz,
  status text not null default 'active' check (status in ('active', 'completed')),
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Only one shift should be active at a time. Enforced in the app layer,
-- but this index makes it cheap to look up.
create index if not exists shifts_status_idx on shifts (status);
create index if not exists shifts_start_time_idx on shifts (start_time desc);

alter table shifts enable row level security;

-- Personal single-user tool for now: allow all operations via the anon key.
-- Tighten this with real auth (Supabase Auth) before sharing access with anyone else.
drop policy if exists "Allow all for anon" on shifts;
create policy "Allow all for anon"
  on shifts
  for all
  using (true)
  with check (true);
